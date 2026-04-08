import { createRigidBody } from "./elements";
import world from "./world";
import dispatcher from "./lib/dispatcher";

import { TYPES, DEFAULT_RIGIDBODY_STATE } from "../constants";

export const addPlayer = data => {
    const { uuid, width, height, position, quaternion, mass, friction } = data;

    const capsule = new Ammo.btCapsuleShape(width, height);
    const body = createRigidBody(capsule, {
        uuid, position, quaternion, mass, friction,
        restitution: 0, // no bouncing for player characters
        damping: { linear: 0, angular: 0 }, // we handle damping ourselves
    });

    // disabling rotation for collisions
    body.setAngularFactor(0);

    // store mass for impulse calculations
    body._mass = mass;

    world.addElement({ uuid, body, type: TYPES.PLAYER, state: DEFAULT_RIGIDBODY_STATE });
};

export const handlePlayerUpdate = ({ body, uuid, state = DEFAULT_RIGIDBODY_STATE }, dt) => {
    const { movement, cameraDirection, jump, jumpSpeed, speed: moveSpeed } = state;

    const motionState = body.getMotionState();
    if (!motionState) return;

    const characterSpeed = moveSpeed || 5;

    // Jump — apply a one-time impulse, then clear the flag so it doesn't repeat
    // applyCentralImpulse uses kg·m/s, so multiply by mass to get desired velocity change
    if (jump && jumpSpeed) {
        const mass = body._mass || 80;
        const impulse = new Ammo.btVector3(0, jumpSpeed * mass, 0);
        body.applyCentralImpulse(impulse);
        Ammo.destroy(impulse);

        // Clear the jump flag so it only fires once
        state.jump = false;
    }

    const isMoving = movement && (movement.forward || movement.backwards || movement.left || movement.right);

    const linearVelocity = body.getLinearVelocity();
    const currentY = linearVelocity.y(); // preserve vertical velocity (gravity + jump)

    if (isMoving && cameraDirection) {
        // Compute camera-relative movement direction
        let moveX = 0;
        let moveZ = 0;

        if (movement.forward) { moveX += cameraDirection.x; moveZ += cameraDirection.z; }
        if (movement.backwards) { moveX -= cameraDirection.x; moveZ -= cameraDirection.z; }
        if (movement.left) { moveX += cameraDirection.z; moveZ -= cameraDirection.x; }
        if (movement.right) { moveX -= cameraDirection.z; moveZ += cameraDirection.x; }

        // Normalize direction
        const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
        if (len > 0) { moveX /= len; moveZ /= len; }

        // Set horizontal velocity directly for responsive movement
        linearVelocity.setX(moveX * characterSpeed);
        linearVelocity.setZ(moveZ * characterSpeed);
    } else {
        // Dampen horizontal velocity when not moving
        linearVelocity.setX(linearVelocity.x() * 0.85);
        linearVelocity.setZ(linearVelocity.z() * 0.85);
    }

    // Preserve vertical velocity — let gravity and impulses handle Y
    linearVelocity.setY(currentY);
    body.setLinearVelocity(linearVelocity);

    // Read the current transform (as updated by the physics step)
    // Do NOT write it back — let the simulation own the position
    const transform = new Ammo.btTransform();
    motionState.getWorldTransform(transform);

    const origin = transform.getOrigin();
    const rotation = transform.getRotation();
    const grounded = Math.abs(currentY) < 0.5;

    dispatcher.sendBodyUpdate(uuid, origin, rotation, dt, { grounded });
    Ammo.destroy(transform);
};
