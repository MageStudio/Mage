import {
    Vector3,
    Raycaster
} from 'three';
import Scene from '../core/Scene';
import { Line } from '../entities';

export const DEFAULT_COLLIDER_OFFSET = { x: 0, y: 0, z: 0 };
export const DEFAULT_NEAR = 0;
export const DEFAULT_FAR = 10;

export const getPointsFromRayCollider = (ray, position) => {
    const origin = position.clone();
    const end = origin.add(ray.ray.direction.clone().multiplyScalar(ray.far));

    return [origin, end];
};

export const createColliderHelper = (ray, position) => {
    return new Line(getPointsFromRayCollider(ray, position));
};

export const parseColliderFromDescription = ({ type, vector }, options, mesh, isSprite = false) => {
    const { near = DEFAULT_NEAR, far = DEFAULT_FAR, offset = DEFAULT_COLLIDER_OFFSET, debug = false } = options;
    const parsedOffset = {
        ...DEFAULT_COLLIDER_OFFSET,
        ...offset
    };
    const position = mesh.position
        .clone()
        .add(new Vector3(parsedOffset.x, parsedOffset.y, parsedOffset.z));
    const ray = new Raycaster(position, vector, near, far);
    const helper = debug && createColliderHelper(ray, position);
    
    if (isSprite) {
        ray.setFromCamera(position, Scene.getCameraBody());
    }

    return {
        type,
        ray,
        helper,
        offset: parsedOffset
    };
};