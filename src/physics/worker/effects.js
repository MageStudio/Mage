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
    for (let i=0; i<collisions; i++) {
        const object = Ammo.castObject(ghostCollider.getOverlappingObject(i), Ammo.btRigidBody);
        const transform = new Ammo.btTransform();

        object.getWorldTransform(transform);
        forEachCallback(object, transform, i);

        Ammo.destroy(transform);
    }
}

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
    const distance = position.op_sub(explosionPosition);
    distance.normalize();
    const impulse = distance.op_mul(strength);

    impulse.setY(impulse.y() + strength);

    return impulse;
}

export const createExplosion = ({
    uuid,
    position,
    radius = EXPLOSION_SIZES.SMALL,
    strength = EXPLOSION_STRENGTHS.MEDIUM
}) => {
    try {
        const explosionPosition = getExplosionPosition(uuid, position);
        const { ghostCollider, transform } = createGhostCollider(radius, explosionPosition);

        world.addCollisionObject(ghostCollider);

        forEachGhostCollision(ghostCollider, (object, objectTransform) => {
            const origin = objectTransform.getOrigin();
            object.activate(true);
            object.applyCentralImpulse(getExplosionImpulse(origin, explosionPosition, strength));
        });

        world.getDynamicsWorld().removeCollisionObject(ghostCollider);
        Ammo.destroy(ghostCollider);
        Ammo.destroy(transform);
    } catch(e) {
        console.log(e);
    }
}