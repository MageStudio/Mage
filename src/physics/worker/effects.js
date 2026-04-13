import { EXPLOSION_SIZES, EXPLOSION_STRENGTHS } from "../constants";
import world from "./world";

export const createGhostCollider = (radius, position) => {
    const ghostCollider = new Ammo.btGhostObject();
    const transform = new Ammo.btTransform();

    ghostCollider.setCollisionShape(new Ammo.btSphereShape(radius));
    ghostCollider.getWorldTransform(transform);

    transform.setIdentity();
    transform.setOrigin(position);
    transform.setRotation(new Ammo.btQuaternion(0, 0, 0, 1));

    ghostCollider.setWorldTransform(transform);

    return { ghostCollider, transform };
};

export const forEachGhostCollision = (ghostCollider, forEachCallback = () => {}) => {
    const collisions = ghostCollider.getNumOverlappingObjects();
    for (let i = 0; i < collisions; i++) {
        const object = Ammo.castObject(ghostCollider.getOverlappingObject(i), Ammo.btRigidBody);
        const transform = new Ammo.btTransform();

        object.getWorldTransform(transform);
        forEachCallback(object, transform, i);

        Ammo.destroy(transform);
    }
};

export const getExplosionPosition = (uuid, position) => {
    let explosionPosition = position;
    if (!explosionPosition) {
        const { body } = world.getElement(uuid);
        const motionState = body.getMotionState();
        const transform = new Ammo.btTransform();

        motionState.getWorldTransform(transform);
        explosionPosition = transform.getOrigin();
    }

    return explosionPosition;
};

export const getExplosionImpulse = (position, explosionPosition, strength) => {
    // Calculate direction vector WITHOUT mutating the input btVector3 objects.
    // op_sub/op_mul mutate in place in Ammo.js, which would corrupt the body's transform origin.
    const dx = position.x() - explosionPosition.x();
    const dy = position.y() - explosionPosition.y();
    const dz = position.z() - explosionPosition.z();

    let length = Math.sqrt(dx * dx + dy * dy + dz * dz);

    // If the object is at the explosion center, push it straight up instead of
    // producing an unstable near-zero normalization.
    if (length < 0.001) {
        const impulse = new Ammo.btVector3(0, strength * 2, 0);
        return impulse;
    }

    // Normalize direction
    const nx = dx / length;
    const ny = dy / length;
    const nz = dz / length;

    // Scale by strength and add upward bias
    const impulse = new Ammo.btVector3(nx * strength, ny * strength + strength, nz * strength);

    return impulse;
};

export const createExplosion = ({
    uuid,
    position,
    radius = EXPLOSION_SIZES.SMALL,
    strength = EXPLOSION_STRENGTHS.MEDIUM,
}) => {
    try {
        // Get the source body's Ammo pointer so we can reliably skip it.
        // Ammo.castObject() creates new JS wrappers, so custom properties like
        // .uuid set on the original wrapper are NOT available on cast results.
        // We compare the underlying C++ pointer instead.
        const sourceElement = world.getElement(uuid);
        const sourceBodyPtr =
            sourceElement && sourceElement.body
                ? sourceElement.body.a || sourceElement.body.ptr
                : null;

        const explosionPosition = getExplosionPosition(uuid, position);
        const { ghostCollider, transform } = createGhostCollider(radius, explosionPosition);

        world.addCollisionObject(ghostCollider);

        // Force a collision detection pass so the ghost collider discovers
        // overlapping bodies. Without this, getNumOverlappingObjects() returns 0
        // because btGhostPairCallback only updates during a simulation step.
        world.getDynamicsWorld().performDiscreteCollisionDetection();

        forEachGhostCollision(ghostCollider, (object, objectTransform) => {
            // Skip the source entity using pointer comparison.
            const objectPtr = object.a || object.ptr;
            if (sourceBodyPtr && objectPtr === sourceBodyPtr) return;

            const origin = objectTransform.getOrigin();
            object.activate(true);

            const impulse = getExplosionImpulse(origin, explosionPosition, strength);
            object.applyCentralImpulse(impulse);
            Ammo.destroy(impulse);
        });

        world.getDynamicsWorld().removeCollisionObject(ghostCollider);
        Ammo.destroy(ghostCollider);
        Ammo.destroy(transform);
    } catch (e) {
        console.error("[Physics Worker] createExplosion error:", e);
    }
};
