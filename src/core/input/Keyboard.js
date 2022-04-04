import hotkeys from 'hotkeys-js';
import {
    KEYBOARD_COMBO_ALREADY_REGISTERED,
    KEYBOARD_COMBO_IS_INVALID
} from '../../lib/messages';

import {
    EventDispatcher
} from 'three';

const DEFAULT_OPTIONS = {
    keyup: true,
    keydown: true
};

const COMBINATION_DIVIDER = '+';

export const KEY_PRESS = 'keyPress';
export const KEY_DOWN = 'keyDown';
export const KEY_UP = 'keyUp';

export default class Keyboard extends EventDispatcher {

    constructor() {
        super();
        
        this.combos = [];

        this.enabled = false;
    }

    register(combo, handler) {
        if (this.enabled) {
            if (this.combos.includes(combo)) {
                console.warn(KEYBOARD_COMBO_ALREADY_REGISTERED);
                return;
            }
            this.combos.push(combo);
            hotkeys(combo, DEFAULT_OPTIONS, handler);
        }
    }


    handleKeydown = event => {
        this.dispatchEvent({
            type: KEY_DOWN,
            event
        });
    }

    handleKeyup = event => {
        this.dispatchEvent({
            type: KEY_UP,
            event
        });
    }

    handleKeypress = event => {
        this.dispatchEvent({
            type: KEY_PRESS,
            event
        });
    }

    enable(cb = f => f) {
        this.enabled = true;

        window.addEventListener(KEY_DOWN, this.handleKeydown.bind(this));
        window.addEventListener(KEY_UP, this.handleKeyup.bind(this));
        window.addEventListener(KEY_PRESS, this.handleKeypress.bind(this));
    }

    disable() {
        this.enabled = false;

        window.removeEventListener(KEY_DOWN, this.handleKeydown.bind(this));
        window.removeEventListener(KEY_UP, this.handleKeyup.bind(this));
        window.removeEventListener(KEY_PRESS, this.handleKeypress.bind(this));
    }

    isPressed(key) {
        return hotkeys.isPressed(key);
    }
}
