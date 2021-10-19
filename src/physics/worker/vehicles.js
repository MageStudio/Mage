import {
    DISABLE_DEACTIVATION,
    TYPES,
    DEFAULT_VEHICLE_STATE,
    BACK_LEFT,
    BACK_RIGHT,
    FRONT_LEFT,
    FRONT_RIGHT,
    DEFAULT_MAX_ENGINE_FORCE,
    DEFAULT_MAX_BREAKING_FORCE,
    DEFAULT_STEERING_CLAMP,
    DEFAULT_STEERING_INCREMENT
} from '../constants';

import {
    PHYSICS_EVENTS
} from '../messages';

import world from './world';
import dispatcher from './lib/dispatcher';

const DEFAULT_ROLL_INFLUENCE = 0.2;
const DEFAULT_FRICTION = 1000;
const DEFAULT_MASS = 800;

export const addVehicle = data => {
    const {
        position,
        quaternion,
        uuid,
        wheels,
        mass = DEFAULT_MASS,
        width = 1.8,
        height = .6,
        length = 4,
        friction = DEFAULT_FRICTION,
        rollInfluence = DEFAULT_ROLL_INFLUENCE,
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
    const rayCaster = new Ammo.btDefaultVehicleRaycaster(world.getDynamicsWorld());
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

    vehicle.uuid = uuid;

    world.setBody({
        type: TYPES.VEHICLE,
        uuid,
        vehicle: vehicle,
        wheels,
        options: data,
        state: DEFAULT_VEHICLE_STATE
    });
}

export const setVehiclePosition = data => {
    const { uuid, position } = data;
    const element = world.getElement(uuid);

    if (element.type === TYPES.VEHICLE) {
        const body = element.vehicle.getRigidBody();
        const transform = new Ammo.btTransform();

        body.getWorldTransform(transform);
        transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z ));

        body.setWorldTransform(transform);
    }
};

export const setVehicleQuaternion = data => {
    const { uuid, quaternion } = data;
    const element = world.getElement(uuid);

    if (element.type === TYPES.VEHICLE) {
        const body = element.vehicle.getRigidBody();
        const transform = new Ammo.btTransform();

        body.getWorldTransform(transform);
        transform.setRotation(new Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w));

        body.setWorldTransform(transform);
    }
};

export const resetVehicle = data => {
    const { uuid, quaternion, position } = data;
    const element = world.getElement(uuid);

    if (element.type === TYPES.VEHICLE) {
        const body = element.vehicle.getRigidBody();
        const transform = new Ammo.btTransform();
        
        body.getWorldTransform(transform);

        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z ));
        transform.setRotation(new Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w));

        body.setWorldTransform(transform);
    }
}

export const handleVehicleUpdate = ({ vehicle, wheels, uuid, state = DEFAULT_VEHICLE_STATE, options = {} }, dt) => {
    const speed = vehicle.getCurrentSpeedKmHour();

    dispatcher.sendDispatchEvent(uuid, PHYSICS_EVENTS.VEHICLE.SPEED, { speed });

    let breakingForce = 0;
    let engineForce = 0;

    const {
        steeringClamp = DEFAULT_STEERING_CLAMP,
        steeringIncrement = DEFAULT_STEERING_INCREMENT,
        maxEngineForce = DEFAULT_MAX_ENGINE_FORCE,
        maxBreakingForce = DEFAULT_MAX_BREAKING_FORCE
    } = options;

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
        dispatcher.sendBodyUpdate(wheelUUID, p, q, dt);
    }

    tm = vehicle.getChassisWorldTransform();
    p = tm.getOrigin();
    q = tm.getRotation();

    const direction = vehicle.getForwardVector();
    dispatcher.sendDispatchEvent(uuid, PHYSICS_EVENTS.VEHICLE.DIRECTION, {
        direction: {
            x: direction.x(),
            y: direction.y(),
            z: direction.z()
        }
    });

    dispatcher.sendBodyUpdate(uuid, p, q, dt);
    world.updateBodyState(uuid, state);
}