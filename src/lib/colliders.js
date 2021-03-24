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