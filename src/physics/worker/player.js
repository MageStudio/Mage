import { createRigidBody } from './bodies';
import world from './world';

import {
    TYPES,
    DEFAULT_RIGIDBODY_STATE
} from '../constants';

export const addPlayer = (data) => {
    const { uuid, width, height, position, quaternion, mass, friction } = data;

    const capsule = new Ammo.btCapsuleShape(width, height);
    const body = createRigidBody(capsule, { position, quaternion, mass, friction });

    // disabliing rotation for collisions
    body.setAngularFactor(0);

    world.addRigidBody(body);
    world.setBody({ uuid, body, type: TYPES.PLAYER, state: DEFAULT_RIGIDBODY_STATE });
};

export const handlePlayerUpdate = ({ body, uuid, state = DEFAULT_RIGIDBODY_STATE }, dt) => {
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

        dispatcher.sendBodyUpdate(uuid, origin, rotation, dt);
    }
};