export const LIBRARY_NAME = 'ammo.js';

export const TYPES = {
    BOX: 'BOX',
    SPHERE: 'SPHERE',
    VEHICLE: 'VEHICLE',
    MESH: 'MESH',
    PLAYER: 'PLAYER'
};

export const COLLIDER_TYPES = {
    BOX: 'BOX',
    VEHICLE: 'VEHICLE',
    PLAYER: 'PLAYER',
    SPHERE: 'SPHERE'
};

export const DEFAULT_VEHICLE_STATE = {
    vehicleSteering: 0,
    acceleration: false,
    breaking: false,
    right: false,
    left: false
};

export const DEFAULT_RIGIDBODY_STATE = {
    velocity: { x: 0, y: 0, z: 0 },
    movement: {
        forward: false,
        backwards: false,
        left: false,
        right: false
    },
    direction: {
        x: 0,
        y: 0,
        z: 0
    }
};

export const DEFAULT_SCALE = { x: 1, y: 1, z: 1 };
export const DEFAULT_QUATERNION = { x: 0, y: 0, z: 0, w: 1 };
export const DEFAULT_POSITION = { x: 0, y: 0, z: 0 };
export const DEFAULT_LINEAR_VELOCITY = { x: 0, y: 0, z: 0 };
export const DEFAULT_ANGULAR_VELOCITY = { x: 0, y: 0, z: 0 };
export const DEFAULT_IMPULSE = { x: 0, y: 0, z: 0 };

export const DISABLE_DEACTIVATION = 4;
export const GRAVITY = { x: 0, y: -10, z: 0 };

export const FRONT_LEFT = 0;
export const FRONT_RIGHT = 1;
export const BACK_LEFT = 2;
export const BACK_RIGHT = 3;

export const DEFAULT_STEERING_INCREMENT = .04;
export const DEFAULT_STEERING_CLAMP = .5;
export const DEFAULT_MAX_ENGINE_FORCE = 2000;
export const DEFAULT_MAX_BREAKING_FORCE = 100;

export const EXPLOSION_SIZES = {
    SMALL: 4,
    MEDIUM: 6,
    LARGE: 8,
    MASSIVE: 12
};

export const EXPLOSION_STRENGTHS = {
    VERY_WEAK: 2,
    WEAK: 4,
    MEDIUM: 8,
    LARGE: 16,
    MASSIVE: 32,
    OK_NO: 64
};