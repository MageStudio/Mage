import { EventDispatcher } from "three";

import Keyboard, { KEY_DOWN, KEY_PRESS, KEY_UP } from "./Keyboard";

import Mouse, { MOUSE_DOWN, MOUSE_UP, ELEMENT_CLICK, ELEMENT_DESELECT, MOUSE_MOVE } from "./Mouse";

import Gamepad, {
    GAMEPAD_DISCONNECTED_EVENT,
    GAMEPAD_CONNECTED_EVENT,
    BUTTON_PRESSED_EVENT,
    BUTTON_RELEASED_EVENT,
    AXIS_CHANGE_EVENT,
} from "./Gamepad";

import { dispatch } from "../../store/Store";
import {
    inputEnabled,
    inputDisabled,
    gamepadEnabled,
    keyboardEnabled,
    mouseEnabled,
    keyboardDisabled,
    mouseDisabled,
    gamepadDisabled,
} from "../../store/actions/input";

export const INPUT_EVENTS_LIST = [
    KEY_PRESS,
    KEY_DOWN,
    KEY_UP,
    MOUSE_DOWN,
    MOUSE_UP,
    MOUSE_DOWN,
    ELEMENT_CLICK,
    ELEMENT_DESELECT,
    GAMEPAD_CONNECTED_EVENT,
    GAMEPAD_DISCONNECTED_EVENT,
    BUTTON_PRESSED_EVENT,
    BUTTON_RELEASED_EVENT,
    AXIS_CHANGE_EVENT,
];

export const INPUT_EVENTS = {
    KEY_PRESS,
    KEY_DOWN,
    KEY_UP,
    MOUSE_DOWN,
    MOUSE_UP,
    MOUSE_DOWN,
    MOUSE_MOVE,
    ELEMENT_CLICK,
    ELEMENT_DESELECT,
    GAMEPAD_CONNECTED_EVENT,
    GAMEPAD_DISCONNECTED_EVENT,
    BUTTON_PRESSED_EVENT,
    BUTTON_RELEASED_EVENT,
    AXIS_CHANGE_EVENT,
};

export class Input extends EventDispatcher {
    constructor() {
        super();
        this.enabled = false;
        this.mouse = new Mouse();
        this.keyboard = new Keyboard();
        this.gamepad = new Gamepad();
    }

    get EVENTS() {
        return INPUT_EVENTS;
    }

    enable() {
        if (!this.enabled) {
            dispatch(inputEnabled());
            this.enableGamepad();
            this.enableKeyboard();
            this.enableMouse();
            this.enabled = true;
        }
    }

    disable() {
        if (this.enabled) {
            dispatch(inputDisabled());
            this.disableKeyboard();
            this.disableMouse();
            this.disableGamepad();
            this.enabled = false;
        }
    }

    isEnabled() {
        return this.enabled;
    }

    enableGamepad() {
        dispatch(gamepadEnabled());

        this.gamepad.enable();
        this.gamepad.addEventListener(GAMEPAD_CONNECTED_EVENT, this.propagate.bind(this));
        this.gamepad.addEventListener(GAMEPAD_DISCONNECTED_EVENT, this.propagate.bind(this));
        this.gamepad.addEventListener(BUTTON_RELEASED_EVENT, this.propagate.bind(this));
        this.gamepad.addEventListener(BUTTON_PRESSED_EVENT, this.propagate.bind(this));
        this.gamepad.addEventListener(BUTTON_RELEASED_EVENT, this.propagate.bind(this));
        this.gamepad.addEventListener(AXIS_CHANGE_EVENT, this.propagate.bind(this));
    }

    enableKeyboard() {
        dispatch(keyboardEnabled());
        this.keyboard.enable();

        this.keyboard.addEventListener(KEY_DOWN, this.propagate.bind(this));
        this.keyboard.addEventListener(KEY_UP, this.propagate.bind(this));
    }

    enableMouse() {
        dispatch(mouseEnabled());

        this.mouse.enable();
        this.mouse.addEventListener(MOUSE_DOWN, this.propagate.bind(this));
        this.mouse.addEventListener(MOUSE_UP, this.propagate.bind(this));
        this.mouse.addEventListener(MOUSE_MOVE, this.propagate.bind(this));
        this.mouse.addEventListener(ELEMENT_CLICK, this.propagate.bind(this));
        this.mouse.addEventListener(ELEMENT_DESELECT, this.propagate.bind(this));
    }

    propagate = event => {
        this.dispatchEvent(event);
    };

    disableKeyboard() {
        dispatch(keyboardDisabled());

        this.keyboard.disable();
        this.keyboard.removeEventListener(KEY_DOWN, this.propagate.bind(this));
        this.keyboard.removeEventListener(KEY_UP, this.propagate.bind(this));

        this.keyboard = undefined;
    }

    disableMouse() {
        dispatch(mouseDisabled());

        this.mouse.disable();
        this.mouse.removeEventListener(MOUSE_DOWN, this.propagate.bind(this));
        this.mouse.removeEventListener(MOUSE_UP, this.propagate.bind(this));
        this.mouse.removeEventListener(MOUSE_MOVE, this.propagate.bind(this));
        this.mouse.removeEventListener(ELEMENT_CLICK, this.propagate.bind(this));
        this.mouse.removeEventListener(ELEMENT_DESELECT, this.propagate.bind(this));

        this.mouse = undefined;
    }

    disableGamepad() {
        dispatch(gamepadDisabled());

        this.gamepad.disable();
        this.gamepad.removeEventListener(GAMEPAD_CONNECTED_EVENT, this.propagate.bind(this));
        this.gamepad.removeEventListener(GAMEPAD_DISCONNECTED_EVENT, this.propagate.bind(this));
        this.gamepad.removeEventListener(BUTTON_PRESSED_EVENT, this.propagate.bind(this));
        this.gamepad.removeEventListener(BUTTON_RELEASED_EVENT, this.propagate.bind(this));
        this.gamepad.removeEventListener(AXIS_CHANGE_EVENT, this.propagate.bind(this));

        this.gamepad = null;
    }

    update() {
        if (this.isEnabled() && this.gamepad.isEnabled()) {
            this.gamepad.update();
        }
    }
}

export default new Input();
