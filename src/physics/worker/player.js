import { createRigidBody } from "./elements";
import world from "./world";
import dispatcher from "./lib/dispatcher";

import { TYPES, DEFAULT_RIGIDBODY_STATE } from "../constants";

export const addPlayer = data => {
    const { uuid, width, height, position, quaternion, mass, friction } = data;

    const capsule = new Ammo.btCapsuleShape(width, height);
    const body = createRigidBody(capsule, { uuid, position, quaternion, mass, friction });

    // disabling rotation for collisions
    body.setAngularFactor(0);

    world.addElement({ uuid, body, type: TYPES.PLAYER, state: DEFAULT_RIGIDBODY_STATE });
};

export const handlePlayerUpdate = ({ body, uuid, state = DEFAULT_RIGIDBODY_STATE }, dt) => {
    const { movement, cameraDirection } = state;

    const MAX_SPEED = 5;
    const walkVelocity = 5.0;

    const motionState = body.getMotionState();

    if (motionState) {
        const transform = new Ammo.btTransform();
        motionState.getWorldTransform(transform);

        const linearVelocity = body.getLinearVelocity();
        const speed = linearVelocity.length();

        const walkSpeed = walkVelocity * dt;

        const isMoving = movement.forward || movement.backwards || movement.left || movement.right;

        if (!isMoving) {
            // apply damping when not moving
            linearVelocity.setX(linearVelocity.x() * 0.2);
            linearVelocity.setZ(linearVelocity.z() * 0.2);
        } else if (speed < MAX_SPEED) {
            // camera-relative movement direction
            let moveX = 0;
            let moveZ = 0;

            // forward/backward along camera direction
            if (movement.forward) {
                moveX += cameraDirection.x;
                moveZ += cameraDirection.z;
            }
            if (movement.backwards) {
                moveX -= cameraDirection.x;
                moveZ -= cameraDirection.z;
            }

            // strafe left/right using perpendicular camera vector
            if (movement.left) {
                moveX += cameraDirection.z;
                moveZ -= cameraDirection.x;
            }
            if (movement.right) {
                moveX -= cameraDirection.z;
                moveZ += cameraDirection.x;
            }

            linearVelocity.setX(linearVelocity.x() + moveX * walkSpeed);
            linearVelocity.setZ(linearVelocity.z() + moveZ * walkSpeed);
        }

        body.setLinearVelocity(linearVelocity);

        body.getMotionState().setWorldTransform(transform);
        body.setCenterOfMassTransform(transform);

        let origin = transform.getOrigin();
        let rotation = transform.getRotation();

        dispatcher.sendBodyUpdate(uuid, origin, rotation, dt);
    }
};
