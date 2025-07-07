import { Vector3, MathUtils, Vector2 } from "three";

export const PI = Math.PI;
export const PI_2 = PI / 2;

export const identity = a => a;

export const pickRandom = (list = []) => list[Math.floor(Math.random() * list.length)];

export const degToRad = angle => {
    return angle * (PI / 180);
};
export const radToDeg = angle => {
    return angle * (180 / PI);
};

export const getProportion = (max1, b, max2) => {
    return (max1 * b) / max2;
};

export const clamp = (value, min, max) => (value < min ? min : value > max ? max : value);

export const cap = (value, max) => (value > max ? max : value);

export const isWithin = (value, min, max) => {
    return value >= min && value < max;
};

export const randomFloatFromInterval = (min, max) => {
    return Math.random() * (max - min + 1) + min;
};

export const randomIntFromInterval = (min, max) => {
    // min and max included
    return Math.floor(randomFloatFromInterval(min, max));
};

export const getDistance = (
    { x: xA = 0, y: yA = 0, z: zA = 0 } = {},
    { x: xB = 0, y: yB = 0, z: zB = 0 } = {},
) => Math.sqrt(Math.pow(xA - xB, 2) + Math.pow(yA - yB, 2) + Math.pow(zA - zB, 2));

export const findPointBetweenAtDistance = (
    { x: xC = 0, y: yC = 0, z: zC = 0 } = {},
    { x: xE = 0, y: yE = 0, z: zE = 0 } = {},
    distance = 1,
) => {
    const vCenter = new Vector3(xC, yC, zC);
    const vEnd = new Vector3(xE, yE, zE);

    const point = vCenter.add(vEnd.sub(vCenter).normalize().multiplyScalar(distance));

    return {
        x: point.x,
        y: point.y,
        z: point.z,
    };
};

export const lerpVectors = (origin, target, speed) => {
    const originVector = new Vector3(origin.x, origin.y, origin.z);
    const targetVector = new Vector3(target.x, target.y, target.z);

    originVector.lerp(targetVector, speed);

    return {
        x: originVector.x,
        y: originVector.y,
        z: originVector.z,
    };
};

export const lerp = (x, y, t) => MathUtils.lerp(x, y, t);

export const scaleVector = ({ x = 0, y = 0, z = 0 }, scale = 1) =>
    new Vector3(x, y, z).multiplyScalar(scale);

export const getSphereVolume = radius => (4 * Math.PI * Math.pow(radius, 3)) / 3;

export const repeat = (t, length) => clamp(t - Math.floor(t / length) * length, 0.0, length);

export const deltaAngle = (angle, target) => {
    let delta = repeat(target - angle, 360.0);
    if (delta > 180.0) delta -= 360.0;
    return delta;
};

export const smoothDamp = (
    current,
    target,
    currentVelocity,
    smoothTime,
    maxSpeed = Infinity,
    dt,
) => {
    smoothTime = Math.max(0.0001, smoothTime);
    const omega = 2 / smoothTime;

    const x = omega * dt;
    const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
    let change = current - target;
    const originalTo = target;

    // Clamp maximum speed
    const maxChange = maxSpeed * smoothTime;
    change = clamp(change, -maxChange, maxChange);
    target = current - change;

    const temp = (currentVelocity + omega * change) * dt;
    currentVelocity = (currentVelocity - omega * temp) * exp;
    let output = target + (change + temp) * exp;

    // Prevent overshooting
    if (originalTo - current > 0.0 == output > originalTo) {
        output = originalTo;
        currentVelocity = (output - originalTo) / dt;
    }

    return [output, currentVelocity];
};

export const smoothDampAngle = (
    current,
    target,
    currentVelocity,
    smoothTime,
    maxSpeed = Infinity,
    dt,
) => {
    target = current + deltaAngle(current, target);
    return smoothDamp(current, target, currentVelocity, smoothTime, maxSpeed, dt);
};

export const randomVector3 = (min = 0, max = 1) =>
    new Vector3(
        randomFloatFromInterval(min, max),
        randomFloatFromInterval(min, max),
        randomFloatFromInterval(min, max),
    );

export const randomVector2 = (min = 0, max = 1) =>
    new Vector2(randomFloatFromInterval(min, max), randomFloatFromInterval(min, max));
