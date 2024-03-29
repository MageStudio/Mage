export const ENTITY_TYPES = {
    SCENE: 'SCENE',
    CAMERA: 'CAMERA',
    MESH: 'MESH',
    LABEL: 'LABEL',
    LIGHT: {
        DEFAULT: 'LIGHT.DEFAULT',
        AMBIENT: 'LIGHT.AMBIENT',
        SUN: 'LIGHT.SUN',
        HEMISPHERE: 'LIGHT.HEMISPHERE',
        POINT: 'LIGHT.POINT',
        SPOT: 'LIGHT.SPOT'
    },
    AUDIO: {
        DEFAULT: 'AUDIO.DEFAULT',
        DIRECTIONAL: 'AUDIO.DIRECTIONAL',
        AMBIENT: 'AUDIO.AMBIENT'
    },
    MODEL: 'MODEL',
    SPRITE: 'SPRITE',
    PARTICLE: 'PARTICLE',
    EFFECT: {
        PARTICLE: 'EFFECT.PARTICLE',
        SCENERY: 'EFFECT.SCENERY'
    },
    HELPER: {
        GRID: 'HELPER.GRID',
        AXES: 'HELPER.AXES'
    },
    UNKNOWN: 'UNKNOWN'
};

export const FLAT_ENTITY_TYPES = [
    ENTITY_TYPES.SCENE,
    ENTITY_TYPES.CAMERA,
    ENTITY_TYPES.MESH,
    ENTITY_TYPES.LABEL,
    ENTITY_TYPES.LIGHT.DEFAULT,
    ENTITY_TYPES.LIGHT.AMBIENT,
    ENTITY_TYPES.LIGHT.SUN,
    ENTITY_TYPES.LIGHT.HEMISPHERE,
    ENTITY_TYPES.LIGHT.POINT,
    ENTITY_TYPES.LIGHT.SPOT,
    ENTITY_TYPES.AUDIO.DEFAULT,
    ENTITY_TYPES.AUDIO.AMBIENT,
    ENTITY_TYPES.AUDIO.DIRECTIONAL,
    ENTITY_TYPES.AUDIO.BACKGROUND,
    ENTITY_TYPES.MODEL,
    ENTITY_TYPES.SPRITE,
    ENTITY_TYPES.PARTICLE,
    ENTITY_TYPES.EFFECT.PARTICLE,
    ENTITY_TYPES.EFFECT.SCENERY,
    ENTITY_TYPES.HELPER.GRID,
    ENTITY_TYPES.HELPER.AXES,
    ENTITY_TYPES.UNKNOWN
]

export const ENTITY_EVENTS = {
    DISPOSE: 'DISPOSE',
    STATE_MACHINE: {
        CHANGE: 'STATE_MACHINE_CHANGE',
    },
    ANIMATION: {
        LOOP: 'LOOP',
        FINISHED: 'FINISHED'
    },
    AUDIO: {
        ENDED: 'ended'
    }
};

export const DEFAULT_TAG = 'all';