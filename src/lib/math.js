import { Vector3 } from 'three';

export const PI = Math.PI;
export const PI_2 = PI/2;

export const degToRad = (angle) => {
    return angle * (PI / 180);
}

export const getProportion = (max1, b, max2) => {
    return (max1 * b)/max2;
}

export const getDistance = (
    { x: xA = 0, y: yA = 0, z: zA = 0 } = {},
    { x: xB = 0, y: yB = 0, z: zB = 0 } = {}) => (
        Math.sqrt(
            Math.pow(xA - xB, 2) +
            Math.pow(yA - yB, 2) +
            Math.pow(zA - zB, 2)
        )
);

export const findPointBetweenAtDistance = (
    { x: xC = 0, y: yC = 0, z: zC = 0 } = {},
    { x: xE = 0, y: yE = 0, z: zE = 0 } = {},
    distance = 1) => {

    const vCenter = new Vector3(xC, yC, zC);
    const vEnd = new Vector3(xE, yE, zE);

    const point = vCenter.add(
        vEnd
            .sub(vCenter)
            .normalize()
            .multiplyScalar(distance)
        );

    return {
        x: point.x,
        y: point.y,
        z: point.z
    };
}
