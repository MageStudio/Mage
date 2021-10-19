export const PHYSICS_EVENTS = {
    DISPATCH: 'physics:dispatch',
    TERMINATE: 'physics:terminate',
    LOAD: {
        AMMO: 'physics:load:ammo',
    },
    READY: 'physics:ready',
    INIT: 'physics:init',
    UPDATE: 'physics:update',
    
    ADD: {
        BOX: 'physics:add:box',
        VEHICLE: 'physics:add:vehicle',
        MODEL: 'physics:add:model',
        PLAYER: 'physics:add:player',
        SPHERE: 'physics:add:sphere',
    },

    ELEMENT: {
        DISPOSE: 'physics:element:dispose',
        COLLISION: 'physics:element:collision',
        UPDATE: 'physics:element:update',
        CREATED: 'physics:element:created',

        SET: {
            POSITION: 'physics:element:set:position',
            QUATERNION: 'physics:element:set:quaternion',
            LINEAR_VELOCITY: 'physics:element:set:linear_velocity'
        },

        APPLY: {
            IMPULSE: 'physics:element:apply:impulse'
        }
    },

    VEHICLE: {
        SET: {
            POSITION: 'physics:vehicle:set:position',
            QUATERNION: 'physics:vehicle:set:quaternion'
        },
        RESET: 'physics:vehicle:reset',
        
        SPEED: 'physics:vehicle:speed',
        DIRECTION: 'physics:vehicle:direction'
    },

    EFFECTS: {
        EXPLOSION: 'physics:effects:explosion'
    }
};