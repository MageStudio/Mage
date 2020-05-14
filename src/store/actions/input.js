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
} from "./types";

export const inputEnabled = () => ({
    type: INPUT_ENABLED
});

export const keyboardEnabled = () => ({
    type: KEYBOARD_ENABLED
});

export const mouseEnabled = () => ({
    type: MOUSE_ENABLED
});

export const gamepadEnabled = () => ({
   type: GAMEPAD_ENABLED 
});

export const inputDisabled = () => ({
    type: INPUT_DISABLED
});

export const keyboardDisabled = () => ({
    type: KEYBOARD_DISABLED
});

export const mouseDisabled = () => ({
    type: MOUSE_DISABLED
});

export const gamepadDisabled = () => ({
   type: GAMEPAD_DISABLED 
});

export const gamepadConnected = (gamepads) => ({
    type: GAMEPAD_CONNECTED,
    gamepads
});

export const gamepadDisconnected = (gamepads) => ({
    type: GAMEPAD_DISCONNECTED,
    gamepads
});
