import { createRigidBody } from "./elements";
import world from "./world";
import dispatcher from "./lib/dispatcher";

import { TYPES, DEFAULT_RIGIDBODY_STATE } from "../constants";

export const addPlayer = data => {
    const {
        uuid,
        width,
        height,
        position,
        mass,
        friction,
        originOffset = { x: 0, y: 0, z: 0 },
    } = data;

    // btCapsuleShape expects (radius, cylinderHeight) — use half-width as
    // radius so the capsule wraps the bounding box correctly.
    const radius = width * 0.5;
    const capsule = new Ammo.btCapsuleShape(radius, height);

    // Always create the player body upright (identity quaternion).
    // The visual rotation is driven by the control, not by physics.
    const uprightQuaternion = { x: 0, y: 0, z: 0, w: 1 };

    // Position the capsule at the model's AABB centre so it wraps the
    // visual mesh correctly.  originOffset is the vector from the model's
    // origin to its AABB centre — computed on the main thread where
    // Three.js geometry is available.
    const capsulePosition = {
        x: position.x + originOffset.x,
        y: position.y + originOffset.y,
        z: position.z + originOffset.z,
    };

    const body = createRigidBody(capsule, {
        uuid,
        position: capsulePosition,
        quaternion: uprightQuaternion,
        mass,
        friction,
        restitution: 0,
        damping: { linear: 0.1, angular: 1 },
    });

    // Disable rotation on all axes — the visual rotation is driven by the control.
    // Use btVector3 instead of scalar for compatibility across Ammo.js builds.
    const zeroAngular = new Ammo.btVector3(0, 0, 0);
    body.setAngularFactor(zeroAngular);
    Ammo.destroy(zeroAngular);

    // Enable continuous collision detection to prevent tunneling at high speeds.
    body.setCcdMotionThreshold(radius * 0.5);
    body.setCcdSweptSphereRadius(radius * 0.8);

    // Store for use in handlePlayerUpdate — offset is subtracted when
    // sending position back so the visual stays at the model origin.
    body._mass = mass;
    body._originOffset = originOffset;

    world.addElement({ uuid, body, type: TYPES.PLAYER, state: DEFAULT_RIGIDBODY_STATE });
};

export const handlePlayerUpdate = ({ body, uuid, state = DEFAULT_RIGIDBODY_STATE }, dt) => {
    const { movement, cameraDirection, jump, jumpSpeed, speed: moveSpeed } = state;

    const motionState = body.getMotionState();
    if (!motionState) return;

    // Force-clear angular velocity every tick. The player capsule must stay
    // upright — rotation is handled visually by the control, not by physics.
    const zeroAngVel = new Ammo.btVector3(0, 0, 0);
    body.setAngularVelocity(zeroAngVel);
    Ammo.destroy(zeroAngVel);

    // Force the physics body rotation to identity (upright) every tick.
    // Contact forces can still rotate the capsule in some Ammo.js builds
    // even with angularFactor=(0,0,0). We must reset BOTH the body world
    // transform AND the motionState — they can diverge.
    const worldTransform = body.getWorldTransform();
    const uprightQuat = new Ammo.btQuaternion(0, 0, 0, 1);
    worldTransform.setRotation(uprightQuat);
    body.setWorldTransform(worldTransform);
    motionState.setWorldTransform(worldTransform);
    Ammo.destroy(uprightQuat);

    const characterSpeed = moveSpeed || 5;

    // Jump — apply a one-time impulse, then clear the flag so it doesn't repeat
    if (jump && jumpSpeed) {
        const mass = body._mass || 80;
        const impulse = new Ammo.btVector3(0, jumpSpeed * mass, 0);
        body.applyCentralImpulse(impulse);
        Ammo.destroy(impulse);
        state.jump = false;
    }

    const isMoving =
        movement && (movement.forward || movement.backwards || movement.left || movement.right);

    const linearVelocity = body.getLinearVelocity();
    const currentY = linearVelocity.y();

    if (isMoving && cameraDirection) {
        // Compute camera-relative movement direction
        let moveX = 0;
        let moveZ = 0;

        if (movement.forward) {
            moveX += cameraDirection.x;
            moveZ += cameraDirection.z;
        }
        if (movement.backwards) {
            moveX -= cameraDirection.x;
            moveZ -= cameraDirection.z;
        }
        if (movement.left) {
            moveX += cameraDirection.z;
            moveZ -= cameraDirection.x;
        }
        if (movement.right) {
            moveX -= cameraDirection.z;
            moveZ += cameraDirection.x;
        }

        // Normalize direction
        const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
        if (len > 0) {
            moveX /= len;
            moveZ /= len;
        }

        // Set horizontal velocity directly for responsive movement
        const newVel = new Ammo.btVector3(moveX * characterSpeed, currentY, moveZ * characterSpeed);
        body.setLinearVelocity(newVel);
        Ammo.destroy(newVel);
    } else {
        // When idle, only dampen if there's meaningful horizontal velocity.
        // Avoid touching the velocity every frame to let the solver
        // handle floor contact without interference.
        const vx = linearVelocity.x();
        const vz = linearVelocity.z();
        if (Math.abs(vx) > 0.01 || Math.abs(vz) > 0.01) {
            const newVel = new Ammo.btVector3(vx * 0.85, currentY, vz * 0.85);
            body.setLinearVelocity(newVel);
            Ammo.destroy(newVel);
        }
        // Otherwise let physics handle everything — don't override velocity
    }

    // Read from the body's world transform (not motionState) because we
    // maintain it directly above — position comes from physics, rotation
    // is always identity.
    const finalTransform = body.getWorldTransform();
    const origin = finalTransform.getOrigin();
    const rotation = finalTransform.getRotation();
    const grounded = Math.abs(currentY) < 0.5;

    // The physics capsule is offset upward so its bottom aligns with the
    // character's feet.  Subtract the offset before sending the position
    // back so the visual stays at the feet, not the capsule centre.
    // Subtract the origin offset so the position maps back to model-origin
    // space (the visual's transform origin), not the AABB centre.
    const off = body._originOffset || { x: 0, y: 0, z: 0 };
    const adjustedOrigin = new Ammo.btVector3(
        origin.x() - off.x,
        origin.y() - off.y,
        origin.z() - off.z,
    );
    dispatcher.sendBodyUpdate(uuid, adjustedOrigin, rotation, dt, { grounded });
    Ammo.destroy(adjustedOrigin);
};
