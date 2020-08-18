import { Vector3 } from 'three';

export const UP = 'UP';
export const DOWN = 'DOWN';
export const LEFT = 'LEFT';
export const RIGHT = 'RIGHT';
export const FRONT = 'FRONT';
export const BACK = 'BACK';

export const VECTOR_UP = { type: UP, vector: new Vector3(0, 1, 0) };
export const VECTOR_DOWN = { type: DOWN, vector: new Vector3(0, -1, 0) };
export const VECTOR_LEFT = { type: LEFT, vector: new Vector3(1, 0, 0) };
export const VECTOR_RIGHT = { type: RIGHT, vector: new Vector3(-1, 0, 0) };
export const VECTOR_FRONT = { type: FRONT, vector: new Vector3(0,0, 1) };
export const VECTOR_BACK = { type: BACK, vector: new Vector3(0, 0, -1) };

export const MATERIALS = {
    LAMBERT: 0,
    PHONG: 1,
    DEPTH: 2,
    STANDARD: 3,
    BASIC: 4
};

export const EFFECTS = {
    SEPIA: 'SEPIAEFFECT',
    HUE_SATURATION: 'HUESATURATIONEFFECT',
    BLOOM: 'BLOOM',
    DEPTH_OF_FIELD: 'DOF',
    SELECTIVE_OUTLINE: 'SELECTIVEOUTLINE'
};

export const COLLISION_EVENT = 'COLLISION_EVENT';
