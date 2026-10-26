import { Pausable } from "./pausable";

import Keyboard, { KEY_COMBO, KEY_DOWN, KEY_PRESS, KEY_UP } from "./Keyboard";

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
    KEY_DOWN,
    KEY_UP,
    KEY_COMBO,
    MOUSE_DOWN,
    MOUSE_UP,
    MOUSE_MOVE,
    ELEMENT_CLICK,
    ELEMENT_DESELECT,
    GAMEPAD_CONNECTED_EVENT,
    GAMEPAD_DISCONNECTED_EVENT,
    BUTTON_PRESSED_EVENT,
    BUTTON_RELEASED_EVENT,
    AXIS_CHANGE_EVENT,
};

const DEFAULT_ENABLE_OPTIONS = {};

export class Input extends Pausable() {
    constructor() {
        super();
        this.enabled = false;
        this.mouse = new Mouse();
        this.keyboard = new Keyboard();
        this.gamepad = new Gamepad();
        this.snapshot = { keys: new Map(), mouseButtons: new Set(), gamepadButtons: [] };
    }

    setPaused(flag) {
        const wasPaused = this.paused;
        super.setPaused(flag);

        [this.keyboard, this.mouse, this.gamepad].forEach(device => {
            if (device) device.setPaused(flag);
        });

        if (this.paused && !wasPaused) {
            this.snapshot = {
                keys: new Map(this.keyboard ? this.keyboard.keysDown : []),
                mouseButtons: new Set(this.mouse ? this.mouse.buttonsDown : []),
                gamepadButtons: this.gamepad ? this.gamepad.getPressedButtons() : [],
            };
        }
    }

    dispatchMissedReleases() {
        const { keys, mouseButtons, gamepadButtons } = this.snapshot;

        keys.forEach((key, code) => {
            if (!this.keyboard || !this.keyboard.keysDown.has(code)) {
                window.dispatchEvent(new KeyboardEvent("keyup", { key, code }));
            }
        });

        mouseButtons.forEach(button => {
            if (!this.mouse || !this.mouse.buttonsDown.has(button)) {
                document.dispatchEvent(new MouseEvent("mouseup", { button }));
            }
        });

        if (this.gamepad) {
            this.gamepad.dispatchMissedReleases(gamepadButtons);
        }

        this.snapshot = { keys: new Map(), mouseButtons: new Set(), gamepadButtons: [] };
    }

    get EVENTS() {
        return INPUT_EVENTS;
    }

    enable(options = DEFAULT_ENABLE_OPTIONS) {
        if (!this.enabled) {
            dispatch(inputEnabled());
            this.enableGamepad(options.gamepad);
            this.enableKeyboard(options.keyboard);
            this.enableMouse(options.mouse);
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

    enableGamepad(options = {}) {
        dispatch(gamepadEnabled());

        this.gamepad.enable(options);
        this.gamepad.addEventListener(GAMEPAD_CONNECTED_EVENT, this.propagate.bind(this), {
            whilePaused: true,
        });
        this.gamepad.addEventListener(GAMEPAD_DISCONNECTED_EVENT, this.propagate.bind(this), {
            whilePaused: true,
        });
        this.gamepad.addEventListener(BUTTON_RELEASED_EVENT, this.propagate.bind(this), {
            whilePaused: true,
        });
        this.gamepad.addEventListener(BUTTON_PRESSED_EVENT, this.propagate.bind(this), {
            whilePaused: true,
        });
        this.gamepad.addEventListener(BUTTON_RELEASED_EVENT, this.propagate.bind(this), {
            whilePaused: true,
        });
        this.gamepad.addEventListener(AXIS_CHANGE_EVENT, this.propagate.bind(this), {
            whilePaused: true,
        });
    }

    enableKeyboard(options = {}) {
        dispatch(keyboardEnabled());
        this.keyboard.enable(options);

        this.keyboard.addEventListener(KEY_DOWN, this.propagate.bind(this), { whilePaused: true });
        this.keyboard.addEventListener(KEY_UP, this.propagate.bind(this), { whilePaused: true });
        this.keyboard.addEventListener(KEY_COMBO, this.propagate.bind(this), { whilePaused: true });
    }

    enableMouse(options = {}) {
        dispatch(mouseEnabled());

        this.mouse.enable(options);
        this.mouse.addEventListener(MOUSE_DOWN, this.propagate.bind(this), { whilePaused: true });
        this.mouse.addEventListener(MOUSE_UP, this.propagate.bind(this), { whilePaused: true });
        this.mouse.addEventListener(MOUSE_MOVE, this.propagate.bind(this), { whilePaused: true });
        this.mouse.addEventListener(ELEMENT_CLICK, this.propagate.bind(this), {
            whilePaused: true,
        });
        this.mouse.addEventListener(ELEMENT_DESELECT, this.propagate.bind(this), {
            whilePaused: true,
        });
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
