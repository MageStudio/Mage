import dispatcher from './lib/dispatcher';
import world from './world';

import {
    applyMatrix4ToVector3
} from './lib/math';

import {
    DEFAULT_RIGIDBODY_STATE,
    TYPES,
    DEFAULT_SCALE,
    DISABLE_DEACTIVATION,
    DEFAULT_LINEAR_VELOCITY,
    DEFAULT_IMPULSE
} from '../constants';

export const createRigidBody = (shape, { position, quaternion, mass, friction }) => {
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

export const addMesh = (options) => {
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
    world.setBody({ uuid, body, type: TYPES.MESH, state: DEFAULT_RIGIDBODY_STATE });
}

export const addBox = (data) => {
    const { uuid, width, length, height, position, quaternion, mass = 0, friction = 2 } = data;

    const geometry = new Ammo.btBoxShape(new Ammo.btVector3(length * 0.5, height * 0.5, width * 0.5));
    const body = createRigidBody(geometry, { position, quaternion, mass, friction });

    world.setBody({ uuid, body, type: TYPES.BOX, state: DEFAULT_RIGIDBODY_STATE });
};

export const setLinearVelocity = (data) => {
    const { uuid, velocity = DEFAULT_LINEAR_VELOCITY } = data;
    const { body } = world.getElement(uuid);
    const motionState = body.getMotionState();

    if (motionState) {
        const linearVelocity = new Ammo.btVector3(velocity.x, velocity.y, velocity.z);
        body.setLinearVelocity(linearVelocity);
    }
};

export const applyImpuse = data => {
    const { uuid, impulse = DEFAULT_IMPULSE } = data;
    const { body } = world.getElement(uuid);
    const motionState = body.getMotionState();

    if (motionState) {
        const impulseVector = new Ammo.btVector3(impulse.x, impulse.y, impulse.z);
        body.applyCentralImpulse(impulseVector);
    }
}

export const handleRigidbodyUpdate = ({ body, uuid, state = DEFAULT_RIGIDBODY_STATE }, dt) => {
    const motionState = body.getMotionState();
    const transform = new Ammo.btTransform();
    if (motionState) {
        motionState.getWorldTransform(transform);
        let origin = transform.getOrigin();
        let rotation = transform.getRotation();

        dispatcher.sendBodyUpdate(uuid, origin, rotation, dt);
    }
}