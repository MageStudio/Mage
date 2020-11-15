import { createWorker } from '../lib/workers';

const worker = createWorker(() => {

    const LIBRARY_NAME = 'ammo.js';

    const TERMINATE_EVENT = 'TERMINATE_EVENT';
    const DISPATCH_EVENT = 'DISPATCH_EVENT';
    const LOAD_EVENT = 'LOAD_EVENT';
    const READY_EVENT = 'READY_EVENT';
    const UPDATE_BODY_EVENT = 'UPDATE_BODY_EVENT';
    const ADD_BOX_EVENT = 'ADD_BOX_EVENT';
    const ADD_VEHICLE_EVENT = 'ADD_VEHICLE_EVENT';
    const ADD_MESH_EVENT = 'ADD_MESH_EVENT';
    const ADD_PLAYER_EVENT = 'ADD_PLAYER_EVENT';

    const SPEED_CHANGE_EVENT = 'SPEED_CHANGE_EVENT';
    const PHYSICS_UPDATE_EVENT = 'PHYSICS_UPDATE_EVENT';

    const TYPES = {
        BOX: 'BOX',
        VEHICLE: 'VEHICLE',
        MESH: 'MESH',
        PLAYER: 'PLAYER'
    };

    const DEFAULT_VEHICLE_STATE = {
        vehicleSteering: 0,
        acceleration: false,
        breaking: false,
        right: false,
        left: false
    };

    const DEFAULT_RIGIDBODY_STATE = {
        velocity: { x: 0, y: 0, z: 0 },
        movement: {
            forward: false,
            backwards: false,
            left: false,
            right: false
        },
        direction: {
            x: 0,
            y: 0,
            z: 0
        }
    }

    const DEFAULT_SCALE = { x: 1, y: 1, z: 1 };

    const DEFAULT_QUATERNION = { x: 0, y: 0, z: 0, w: 1 };

    const handleLoadEvent = options => Ammo => {
        let elements = {};
        
        const DISABLE_DEACTIVATION = 4;
        const GRAVITY = { x: 0, y: -10, z: 0 };
        // const TRANSFORM_AUX = new Ammo.btTransform();

        const FRONT_LEFT = 0;
        const FRONT_RIGHT = 1;
        const BACK_LEFT = 2;
        const BACK_RIGHT = 3;

        const sendBodyUpdate = (uuid, position, rotation, dt) => {
            postMessage({
                event: UPDATE_BODY_EVENT,
                uuid,
                position: { x: position.x(), y: position.y(), z: position.z() },
                quaternion: { x: rotation.x(), y: rotation.y(), z: rotation.z(), w: rotation.w() },
                dt
            });
        };

        const sendPhysicsUpdate = dt => {
            postMessage({
                event: PHYSICS_UPDATE_EVENT,
                dt
            })
        };

        const sendReadyEvent = () => postMessage({ event: READY_EVENT });
        const sendTerminateEvent = () => postMessage({ event: TERMINATE_EVENT });
        const sendDispatchEvent = (uuid, eventName, eventData) => postMessage({
            event: DISPATCH_EVENT,
            uuid,
            eventName,
            eventData
        });

        const setBody = data => elements[data.uuid] = Object.assign({}, data);
        const updateBodyState = (uuid, state) => elements[uuid].state = Object.assign(elements[uuid].state, state);

        let collisionConfiguration, dispatcher, solver, world;
        const init = () => {
            const { gravity = GRAVITY } = options;

            collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
            dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
            broadphase = new Ammo.btDbvtBroadphase();
            solver = new Ammo.btSequentialImpulseConstraintSolver();
            world = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);
            world.setGravity(new Ammo.btVector3(gravity.x, gravity.y, gravity.z));
        };

        const handleBodyUpdate = ({ body, uuid, state = DEFAULT_RIGIDBODY_STATE }, dt) => {
            const { movement, direction, cameraDirection, quaternion, position } = state;

            const MAX_SPEED = 1;
            const walkVelocity = .1;

            const motionState = body.getMotionState();

            if (motionState) {
                const transform = new Ammo.btTransform();
                motionState.getWorldTransform(transform);

                const linearVelocity = body.getLinearVelocity();
                const speed = linearVelocity.length();

                const forwardDir = transform.getBasis().getRow(2);
                forwardDir.normalize();
                const walkDirection = new Ammo.btVector3(0.0, 0.0, 0.0);

                const walkSpeed = walkVelocity * dt;

                if (movement.forward) {
                    walkDirection.setX( walkDirection.x() + forwardDir.x());
                    //walkDirection.setY( walkDirection.y() + forwardDir.y());
                    walkDirection.setZ( walkDirection.z() + forwardDir.z());
                }
            
                if (movement.backwards) {
                    walkDirection.setX( walkDirection.x() - forwardDir.x());
                    //walkDirection.setY( walkDirection.y() - forwardDir.y());
                    walkDirection.setZ( walkDirection.z() - forwardDir.z());
                }

                console.log(cameraDirection);

                if (!movement.forward && !movement.backwards) {
                    linearVelocity.setX(linearVelocity.x() * 0.2);
                    linearVelocity.setZ(linearVelocity.z() * 0.2);
                } else if (speed < MAX_SPEED) {
                    linearVelocity.setX(linearVelocity.x() + cameraDirection.x * walkSpeed);
                    linearVelocity.setZ(linearVelocity.z() + cameraDirection.z * walkSpeed);
                }

                body.setLinearVelocity(linearVelocity);

                body.getMotionState().setWorldTransform(transform);
                body.setCenterOfMassTransform(transform);

                let origin = transform.getOrigin();
                let rotation = transform.getRotation();


                sendBodyUpdate(uuid, origin, rotation, dt);
            }
        }

        const handleVehicleUpdate = ({ vehicle, wheels, uuid, state = DEFAULT_VEHICLE_STATE }, dt) => {
            const speed = vehicle.getCurrentSpeedKmHour();

            sendDispatchEvent(uuid, SPEED_CHANGE_EVENT, { speed });

            let breakingForce = 0;
            let engineForce = 0;

            const steeringIncrement = .04;
            const steeringClamp = .5;
            const maxEngineForce = 2000;
            const maxBreakingForce = 100;

            if (state.acceleration) {
                if (speed < -1)
                    breakingForce = maxBreakingForce;
                else engineForce = maxEngineForce;
            }
            if (state.braking) {
                if (speed > 1)
                    breakingForce = maxBreakingForce;
                else engineForce = -maxEngineForce / 2;
            }
            if (state.left) {
                if (state.vehicleSteering < steeringClamp)
                    state.vehicleSteering += steeringIncrement;
            } else {
                if (state.right) {
                    if (state.vehicleSteering > -steeringClamp)
                        state.vehicleSteering -= steeringIncrement;
                } else {
                    if (state.vehicleSteering < -steeringIncrement)
                        state.vehicleSteering += steeringIncrement;
                    else {
                        if (state.vehicleSteering > steeringIncrement)
                            state.vehicleSteering -= steeringIncrement;
                        else {
                            state.vehicleSteering = 0;
                        }
                    }
                }
            }

            vehicle.applyEngineForce(engineForce, BACK_LEFT);
            vehicle.applyEngineForce(engineForce, BACK_RIGHT);

            vehicle.setBrake(breakingForce / 2, FRONT_LEFT);
            vehicle.setBrake(breakingForce / 2, FRONT_RIGHT);
            vehicle.setBrake(breakingForce, BACK_LEFT);
            vehicle.setBrake(breakingForce, BACK_RIGHT);

            vehicle.setSteeringValue(state.vehicleSteering, FRONT_LEFT);
            vehicle.setSteeringValue(state.vehicleSteering, FRONT_RIGHT);

            let tm, p, q, i;
            const n = vehicle.getNumWheels();
            for (i = 0; i < n; i++) {
                vehicle.updateWheelTransform(i, true);
                tm = vehicle.getWheelTransformWS(i);
                p = tm.getOrigin();
                q = tm.getRotation();

                const wheelUUID = wheels[i];
                sendBodyUpdate(wheelUUID, p, q, dt);
            }

            tm = vehicle.getChassisWorldTransform();
            p = tm.getOrigin();
            q = tm.getRotation();

            sendBodyUpdate(uuid, p, q, dt);
            updateBodyState(uuid, state);
        }

        const simulate = (dt) => {
            if (world) {
                world.stepSimulation(dt);

                Object
                    .keys(elements)
                    .forEach(uuid => {
                        const element = elements[uuid];
                        switch(element.type) {
                            case TYPES.BOX:
                            case TYPES.MESH:
                            case TYPES.PLAYER:
                                handleBodyUpdate(element, dt);
                                break;
                            case TYPES.VEHICLE:
                                handleVehicleUpdate(element, dt);
                                break;
                            default:
                                break;
                        }
                    });
                sendPhysicsUpdate(dt);
            }
        }

        const createRigidBody = (shape, { position, quaternion, mass, friction }) => {
            const transform = new Ammo.btTransform();

            transform.setIdentity();
            transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
            transform.setRotation(new Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w));
            const motionState = new Ammo.btDefaultMotionState(transform);

            const localInertia = new Ammo.btVector3(0, 0, 0);
            shape.calculateLocalInertia(mass, localInertia);

            const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
            const body = new Ammo.btRigidBody(rbInfo);

            body.setFriction(friction);
            //body.setRestitution(.9);
            //body.setDamping(0.2, 0.2);

            if (mass > 0) {
                body.setActivationState(DISABLE_DEACTIVATION);
            }

            world.addRigidBody(body);

            return body;
        }

        const addPlayer = (data) => {
            const { uuid, width, height, position, quaternion, mass, friction } = data;

            console.log('adding player', data);

            const capsule = new Ammo.btCapsuleShape(width, height);
            const body = createRigidBody(capsule, { position, quaternion, mass, friction });

            // disabliing rotation for collisions
            body.setAngularFactor(0);

            world.addRigidBody(body);

            setBody({ uuid, body, type: TYPES.PLAYER, state: DEFAULT_RIGIDBODY_STATE });
        };

        const addBox = (data) => {
            const { uuid, width, length, height, position, quaternion, mass = 0, friction = 2 } = data;

            const geometry = new Ammo.btBoxShape(new Ammo.btVector3(length * 0.5, height * 0.5, width * 0.5));
            const body = createRigidBody(geometry, { position, quaternion, mass, friction });
        
            setBody({ uuid, body, type: TYPES.BOX, state: DEFAULT_RIGIDBODY_STATE });
        };

        const addVehicle = data => {
            const {
                position,
                quaternion,
                uuid,
                wheels,
                mass = 800,
                width = 1.8,
                height = .6,
                length = 4,
                friction = 1000,
                wheelsOptions = {},
                suspensions = {}
            } = data;

            const { back = {}, front = {} } = wheelsOptions;
            const {
                axisPosition: axisPositionBack = -1,
                radius: wheelRadiusBack = .4,
                halfTrack: wheelHalfTrackBack = 1,
                axisHeight: wheelAxisHeightBack = .3
            } = back;

            const {
                axisPosition: axisPositionFront = 1.7,
                radius: wheelRadiusFront = .4,
                halfTrack: wheelHalfTrackFront = 1,
                axisHeight: wheelAxisHeightFront = .3
            } = front;

            const { stiffness = 20.0, damping = 2.3, compression = 4.4, restLength = 0.6 } = suspensions;

            const rollInfluence = 0.2;

            // Chassis
            const geometry = new Ammo.btBoxShape(new Ammo.btVector3(width * .5, height * .5, length * .5));
            const transform = new Ammo.btTransform();
            transform.setIdentity();
            transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
            transform.setRotation(new Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w));
            const motionState = new Ammo.btDefaultMotionState(transform);
            const localInertia = new Ammo.btVector3(0, 0, 0);
            geometry.calculateLocalInertia(mass, localInertia);
            const chassis = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(mass, motionState, geometry, localInertia));
            chassis.setActivationState(DISABLE_DEACTIVATION);
            world.addRigidBody(chassis);


            // Raycast Vehicle
            const tuning = new Ammo.btVehicleTuning();
            const rayCaster = new Ammo.btDefaultVehicleRaycaster(world);
            const vehicle = new Ammo.btRaycastVehicle(tuning, chassis, rayCaster);
            vehicle.setCoordinateSystem(0, 1, 2);
            world.addAction(vehicle);

            const wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0);
            const wheelAxleCS = new Ammo.btVector3(-1, 0, 0);

            const addWheel = (isFront, pos, radius) => {

                var wheelInfo = vehicle.addWheel(
                    pos,
                    wheelDirectionCS0,
                    wheelAxleCS,
                    restLength,
                    radius,
                    tuning,
                    isFront);
        
                wheelInfo.set_m_suspensionStiffness(stiffness);
                wheelInfo.set_m_wheelsDampingRelaxation(damping);
                wheelInfo.set_m_wheelsDampingCompression(compression);
                wheelInfo.set_m_frictionSlip(friction);
                wheelInfo.set_m_rollInfluence(rollInfluence);
            }
        
            addWheel(true, new Ammo.btVector3(wheelHalfTrackFront, wheelAxisHeightFront, axisPositionFront), wheelRadiusFront);
            addWheel(true, new Ammo.btVector3(-wheelHalfTrackFront, wheelAxisHeightFront, axisPositionFront), wheelRadiusFront);
            addWheel(false, new Ammo.btVector3(-wheelHalfTrackBack, wheelAxisHeightBack, axisPositionBack), wheelRadiusBack);
            addWheel(false, new Ammo.btVector3(wheelHalfTrackBack, wheelAxisHeightBack, axisPositionBack), wheelRadiusBack);
        

            setBody({
                type: TYPES.VEHICLE,
                uuid,
                vehicle: vehicle,
                wheels,
                state: DEFAULT_VEHICLE_STATE
            });
        }

        const applyMatrix4ToVector3 = ({ x = 0, y = 0, z = 0 }, matrix = []) => {
            const w = 1 / ( matrix[ 3 ] * x + matrix[ 7 ] * y + matrix[ 11 ] * z + matrix[ 15 ] );

            return {
                x: ( matrix[ 0 ] * x + matrix[ 4 ] * y + matrix[ 8 ] * z + matrix[ 12 ] ) * w,
                y: ( matrix[ 1 ] * x + matrix[ 5 ] * y + matrix[ 9 ] * z + matrix[ 13 ] ) * w,
                z: ( matrix[ 2 ] * x + matrix[ 6 ] * y + matrix[ 10 ] * z + matrix[ 14 ] ) * w,
            }
        };

        const addMesh = (options) => {
            const {
                uuid,
                vertices,
                matrices,
                indexes,
                position,
                quaternion,
                mass = 0,
                friction = 2
            } = options;

            const scale = DEFAULT_SCALE;

            const bta = new Ammo.btVector3();
            const btb = new Ammo.btVector3();
            const btc = new Ammo.btVector3();
            const triMesh = new Ammo.btTriangleMesh(true, false);

            for (let i = 0; i < vertices.length; i++) {
                const components = vertices[i];
                const index = indexes[i] ? indexes[i] : null;
                const matrix = Array.from(matrices[i]);

                if (index) {
                    for (let j = 0; j < index.length; j += 3) {
                    const ai = index[j] * 3;
                    const bi = index[j + 1] * 3;
                    const ci = index[j + 2] * 3;

                    const va = applyMatrix4ToVector3({ x: components[ai], y: components[ai + 1], z: components[ai + 2] }, matrix);
                    const vb = applyMatrix4ToVector3({ x: components[bi], y: components[bi + 1], z: components[bi + 2] }, matrix);
                    const vc = applyMatrix4ToVector3({ x: components[ci], y: components[ci + 1], z: components[ci + 2] }, matrix);

                    bta.setValue(va.x, va.y, va.z);
                    btb.setValue(vb.x, vb.y, vb.z);
                    btc.setValue(vc.x, vc.y, vc.z);
                    triMesh.addTriangle(bta, btb, btc, false);
                    }
                } else {
                    for (let j = 0; j < components.length; j += 9) {
                        const va = applyMatrix4ToVector3({ x: components[j + 0], y: components[j + 1], z: components[j + 2] }, matrix);
                        const vb = applyMatrix4ToVector3({ x: components[j + 3], y: components[j + 4], z: components[j + 5] }, matrix);
                        const vc = applyMatrix4ToVector3({ x: components[j + 6], y: components[j + 7], z: components[j + 8] }, matrix);

                        bta.setValue(va.x, va.y, va.z);
                        btb.setValue(vb.x, vb.y, vb.z);
                        btc.setValue(vc.x, vc.y, vc.z);
                        triMesh.addTriangle(bta, btb, btc, false);
                    }
                }
            }

            const localScale = new Ammo.btVector3(scale.x, scale.y, scale.z);
            triMesh.setScaling(localScale);
            Ammo.destroy(localScale);

            const collisionShape = new Ammo.btBvhTriangleMeshShape(triMesh, true, true);
            collisionShape.resources = [triMesh];

            Ammo.destroy(bta);
            Ammo.destroy(btb);
            Ammo.destroy(btc);

            const body = createRigidBody(collisionShape, { position, quaternion, mass, friction });
            setBody({ uuid, body, type: TYPES.MESH, state: DEFAULT_RIGIDBODY_STATE });
        }

        const handleTerminateEvent = () => {
            Ammo.destroy(world);
            Ammo.destroy(solver);
            Ammo.destroy(dispatcher);
            Ammo.destroy(collisionConfiguration);

            sendTerminateEvent();
        }

        onmessage = ({ data }) => {
            switch(data.event) {
                case ADD_BOX_EVENT:
                    console.log('add box');
                    addBox(data);
                    break;
                case ADD_VEHICLE_EVENT:
                    console.log('add vehicle');

                    addVehicle(data);
                    break;
                case ADD_MESH_EVENT:
                    console.log('add mesh');

                    addMesh(data);
                    break;
                case ADD_PLAYER_EVENT:
                    console.log('add player');

                    addPlayer(data);
                    break;
                case UPDATE_BODY_EVENT:
                    updateBodyState(data.uuid, data.state);
                    break;
                case TERMINATE_EVENT:
                    handleTerminateEvent();
                default:
                    console.log('unknown', data.event);
                    break;
            }
        }

        let last = Date.now();
        const mainLoop = () => {
            const now = Date.now();
            simulate(now - last);
            last = now;
        }

        setInterval(mainLoop, 1000/60);
        init();
        sendReadyEvent();
    };

    const loadAmmo = (options) => {
        const scriptUrl = options.host + '/' + (options.path || LIBRARY_NAME);
        importScripts(scriptUrl);

        Ammo().then(handleLoadEvent(options));
    };

    onmessage = ({ data }) => {
        switch(data.event) {
            case LOAD_EVENT:
                loadAmmo(data);
                break;
            default:
                break;
        }
    }
});

export default worker;