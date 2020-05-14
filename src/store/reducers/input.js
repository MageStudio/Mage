import {
    INPUT_ENABLED,
    KEYBOARD_ENABLED,
    MOUSE_ENABLED,
    GAMEPAD_ENABLED,
    INPUT_DISABLED,
    KEYBOARD_DISABLED,
    MOUSE_DISABLED,
    GAMEPAD_DISABLED,
    GAMEPAD_CONNECTED,
    GAMEPAD_DISCONNECTED
} from "../actions/types";

const DEFAULT_STATE = {
    keyboard: false,
    mouse: false,
    gamepad: false,
    gamepads: {}
};

export default (state = DEFAULT_STATE, action = {}) => {
    switch(action.type) {
        case INPUT_ENABLED:
            return {
                ...state,
                keyboard: true,
                mouse: true,
                gamepad: true
            };
        case KEYBOARD_ENABLED:
            return {
                ...state,
                keyboard: true
            };
        case MOUSE_ENABLED:
            return {
                ...state,
                mouse: true
            };
        case GAMEPAD_ENABLED:
            return {
                ...state,
                gamepad: true
            };

        case INPUT_DISABLED:
            return {
                ...state,
                keyboard: false,
                mouse: false,
                gamepad: false
            };
        case KEYBOARD_DISABLED:
            return {
                ...state,
                keyboard: false
            };
        case MOUSE_DISABLED:
            return {
                ...state,
                mouse: false
            };
        case GAMEPAD_DISABLED:
            return {
                ...state,
                gamepad: false
            };

        case GAMEPAD_CONNECTED:
        case GAMEPAD_DISCONNECTED:
            return {
                ...state,
                gamepads: action.gamepads
            };
        default:
            return state;
    }
};
