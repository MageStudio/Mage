import { createWorker } from '../lib/workers';

const worker = createWorker(() => {

    const LIBRARY_NAME = 'ammo.js';

    const TERMINATE_EVENT = 'TERMINATE_EVENT';
    const LOAD_EVENT = 'LOAD_EVENT';
    const READY_EVENT = 'READY_EVENT';
    const UPDATE_BODY_EVENT = 'UPDATE_BODY_EVENT';
    const INIT_EVENT = 'INIT_EVENT';
    const ADD_BOX_EVENT = 'ADD_BOX_EVENT';
    const ADD_VEHICLE_EVENT = 'ADD_VEHICLE_EVENT';

    const TYPES = {
        BOX: 'BOX',
        VEHICLE: 'VEHICLE'
    };

    const handleLoadEvent = (Ammo) => {
        let elements = {};
        
        const DISABLE_DEACTIVATION = 4;
        const GRAVITY = new Ammo.btVector3(0, -10, 0);
        // const TRANSFORM_AUX = new Ammo.btTransform();

        const FRONT_LEFT = 0;
        const FRONT_RIGHT = 1;
        const BACK_LEFT = 2;
        const BACK_RIGHT = 3;

        const sendBodyUpdate = (uuid, position, rotation) => {
            postMessage({
                type: UPDATE_BODY_EVENT,
                uuid,
                position: { x: position.x(), y: position.y(), z: position.z() },
                quaternion: { x: rotation.x(), y: rotation.y(), z: rotation.z(), w: rotation.w() }
            });
        }

        const sendReadyEvent = () => postMessage({ type: READY_EVENT });

        const sendTerminateEvent = () => postMessage({ type: TERMINATE_EVENT });

        const setBody = data => {
            elements[data.uuid] = Object.assign({}, data);
        };

        const updateBodyState = ({ uuid, state }) => {
            elements[uuid].state = Object.assign(elements[uuid].state, state);;
        }
 
        // let collisionConfiguration, dispatcher, solver, world;
        const init = () => {
            const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
            const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
            const broadphase = new Ammo.btDbvtBroadphase();
            const solver = new Ammo.btSequentialImpulseConstraintSolver();
            world = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);
            world.setGravity(GRAVITY);
        };

        const handleBodyUpdate = ({ body, uuid }) => {
            const motionState = body.getMotionState();
            const transform = new Ammo.btTransform();
            if (motionState) {
                motionState.getWorldTransform(transform);
                let origin = transform.getOrigin();
                let rotation = transform.getRotation();

                sendBodyUpdate(uuid, origin, rotation);
            }
        }

        const DEFAULT_VEHICLE_STATE = {
            vehicleSteering: 0,
            acceleration: false,
            breaking: false,
            right: false,
            left: false
        };

        const handleVehicleUpdate = ({ vehicle, wheels, uuid, state = DEFAULT_VEHICLE_STATE }) => {
            const speed = vehicle.getCurrentSpeedKmHour();

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
                sendBodyUpdate(wheelUUID, p, q);
            }

            tm = vehicle.getChassisWorldTransform();
            p = tm.getOrigin();
            q = tm.getRotation();

            sendBodyUpdate(uuid, p, q);
            updateBodyState({ uuid, state });
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
                                handleBodyUpdate(element);
                                break;
                            case TYPES.VEHICLE:
                                handleVehicleUpdate(element);
                                break;
                            default:
                                break;
                        }
                    });
            }
        }

        const addBox = (data) => {
            const { uuid, width, length, height, position, quaternion, mass = 0, friction = 2 } = data;

            const geometry = new Ammo.btBoxShape(new Ammo.btVector3(length * 0.5, height * 0.5, width * 0.5));
            const transform = new Ammo.btTransform();

            transform.setIdentity();
            transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
            transform.setRotation(new Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w));
            const motionState = new Ammo.btDefaultMotionState(transform);

            const localInertia = new Ammo.btVector3(0, 0, 0);
            geometry.calculateLocalInertia(mass, localInertia);

            const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, geometry, localInertia);
            const body = new Ammo.btRigidBody(rbInfo);

            body.setFriction(friction);
            //body.setRestitution(.9);
            //body.setDamping(0.2, 0.2);

            if (mass > 0) {
                body.setActivationState(DISABLE_DEACTIVATION);
            }

            world.addRigidBody(body);
            setBody({ uuid, body, type: TYPES.BOX });
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

        const handleTerminateEvent = () => {
            Ammo.destroy(world);
            // Ammo.destroy(solver);
            // Ammo.destroy(dispatcher);
            // Ammo.destroy(collisionConfiguration);

            sendTerminateEvent();
        }

        onmessage = ({ data }) => {
            switch(data.type) {
                case INIT_EVENT:
                    init();
                    break;
                case ADD_BOX_EVENT:
                    addBox(data);
                    break;
                case ADD_VEHICLE_EVENT:
                    addVehicle(data);
                    break;
                case UPDATE_BODY_EVENT:
                    updateBodyState(data);
                    break;
                case TERMINATE_EVENT:
                    handleTerminateEvent();
                default:
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

    const loadAmmo = ({ path = LIBRARY_NAME }) => {
        importScripts(path);

        Ammo().then(handleLoadEvent);
    };

    onmessage = ({ data }) => {
        switch(data.type) {
            case LOAD_EVENT:
                loadAmmo(data);
                break;
            default:
                break;
        }
    }
});

export default worker;