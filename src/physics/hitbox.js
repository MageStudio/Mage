import { Vector3 } from 'three';
import { Box, Sphere } from '../entities';
import { PHYSICS_COLLIDER_TYPES } from './constants';

const HIT_BOX_COLOR = 0xf368e0;
const HIT_BOX_INCREASE = .03;

export const getBoxHitbox = element => {
    const size = new Vector3();
    element.boundingBox.getSize(size);

    const quaternion = element.getQuaternion();

    const scaledSize = {
        x: size.x + HIT_BOX_INCREASE,
        y: size.y + HIT_BOX_INCREASE,
        z: size.z + HIT_BOX_INCREASE
    };
    const box = new Box(scaledSize.x, scaledSize.y, scaledSize.z, HIT_BOX_COLOR);

    //box.setQuaternion(quaternion);
    box.setWireframe(true);
    box.setWireframeLineWidth(2);

    return box;
}

export const getSphereHitbox = element => {
    const radius = element.boundingSphere.radius;
    const quaternion = element.getQuaternion();

    const sphere = new Sphere(radius, HIT_BOX_COLOR);

    sphere.setWireframe(true);
    sphere.setWireframeLineWidth(2);

    return sphere;
};

export const mapColliderTypeToHitbox = (colliderType = PHYSICS_COLLIDER_TYPES.BOX) => ({
    [PHYSICS_COLLIDER_TYPES.BOX]: getBoxHitbox,
    [PHYSICS_COLLIDER_TYPES.SPHERE]: getSphereHitbox
}[colliderType] || getBoxHitbox);