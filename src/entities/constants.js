export const ENTITY_TYPES = {
    SCENE: 'SCENE',
    CAMERA: 'CAMERA',
    MESH: 'MESH',
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
        AMBIENT: 'AUDIO.AMBIENT',
        DIRECTIONAL: 'AUDIO.DIRECTIONAL',
        BACKGROUND: 'AUDIO.BACKGROUND'
    },
    MODEL: 'MODEL',
    SPRITE: 'SPRITE',
    PARTICLE: 'PARTICLE',
    EFFECT: {
        PARTICLE: 'EFFECT.PARTICLE',
        SCENERY: 'EFFECT.SCENERY'
    },
    HELPER: {
        GRID: 'HELPER.GRID'
    },
    UNKNOWN: 'UNKNOWN'
};

export const FLAT_ENTITY_TYPES = [
    'SCENE',
    'CAMERA',
    'MESH',
    'LIGHT.DEFAULT',
    'LIGHT.AMBIENT',
    'LIGHT.SUN',
    'LIGHT.HEMISPHERE',
    'LIGHT.POINT',
    'LIGHT.SPOT',
    'AUDIO.DEFAULT',
    'AUDIO.AMBIENT',
    'AUDIO.DIRECTIONAL',
    'AUDIO.BACKGROUND',
    'MODEL',
    'SPRITE',
    'PARTICLE',
    'EFFECT.PARTICLE',
    'EFFECT.SCENERY',
    'HELPER.GRID',
    'UNKNOWN'
]

export const ENTITY_EVENTS = {
    DISPOSE: 'DISPOSE',
    STATE_MACHINE: {
        CHANGE: 'STATE_MACHINE_CHANGE',
    },
    ANIMATION: {
        LOOP: 'LOOP',
        FINISHED: 'FINISHED'
    }
};

export const DEFAULT_TAG = 'all';