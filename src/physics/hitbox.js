import { Vector3 } from 'three';
import Box from '../entities/base/Box';
import Sphere from '../entities/base/Sphere';
import { COLLIDER_TYPES } from './constants';

const HIT_BOX_COLOR = 0xf368e0;
const HIT_BOX_INCREASE = .03;

const DEFAULT_HITBOX_OPTIONS = {
    shadowsEnabled: false
};

export const getBoxHitbox = element => {
    const size = new Vector3();
    element.boundingBox.getSize(size);

    const scaledSize = {
        x: size.x + HIT_BOX_INCREASE,
        y: size.y + HIT_BOX_INCREASE,
        z: size.z + HIT_BOX_INCREASE
    };
    const box = new Box(scaledSize.x, scaledSize.y, scaledSize.z, HIT_BOX_COLOR, DEFAULT_HITBOX_OPTIONS);

    //box.setQuaternion(quaternion);
    box.setWireframe(true);
    box.setWireframeLineWidth(2);

    return box;
}

export const getSphereHitbox = element => {
    const radius = element.boundingSphere.radius;
    const sphere = new Sphere(radius, HIT_BOX_COLOR, DEFAULT_HITBOX_OPTIONS);

    sphere.setWireframe(true);
    sphere.setWireframeLineWidth(2);

    return sphere;
};

export const mapColliderTypeToHitbox = (colliderType = COLLIDER_TYPES.BOX) => ({
    [COLLIDER_TYPES.BOX]: getBoxHitbox,
    [COLLIDER_TYPES.SPHERE]: getSphereHitbox
}[colliderType] || getBoxHitbox);

export const addHitBox = element => {
    const colliderType = element.getPhysicsOptions('colliderType');
    const getHitbox = mapColliderTypeToHitbox(colliderType)

    element.add(getHitbox(element));
};