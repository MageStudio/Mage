import hotkeys from 'hotkeys-js';
import {
    KEYBOARD_COMBO_ALREADY_REGISTERED,
    KEYBOARD_COMBO_IS_INVALID
} from '../../lib/messages';

const DEFAULT_OPTIONS = {
    keyup: true,
    keydown: true
};

const COMBINATION_DIVIDER = '+';

export default class Keyboard {

    constructor() {
        this.keys = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'l', 'k', 'j', 'h', 'g', 'f', 'd', 's', 'a', 'z', 'x', 'c', 'v', 'b', 'n', 'm'];
        this.specials = ['esc', 'escape', 'enter', 'space'];
        this.symbols = [];

        this.combos = [
            ...this.keys,
            ...this.specials,
            ...this.symbols
        ];

        this.enabled = false;
        this.listener = undefined;
    }

    static get KEYDOWN() { return 'keydown'; }
    static get KEYUP() { return 'keyup'; }

    register(combo, handler) {
        if (this.enabled) {
            if (this.combos.includes(combo)) {
                console.warn(KEYBOARD_COMBO_ALREADY_REGISTERED);
                return;
            }
            this.combos.push(combo);
            hotkeys(combo, DEFAULT_OPTIONS, handler || this.handler);
        }
    }

    registerCombination(combo = [], handler) {
        if (combo instanceof Array && combo.length > 1) {
            this.register(combo.join(COMBINATION_DIVIDER), handler);
        } else {
            console.warn(KEYBOARD_COMBO_IS_INVALID, combo);
        }
    }

    handler = (event, handler) => {
        if (!this.enabled) return;
        this.listener(event, handler);

        // this stops propagation and deafult OS handling for events like cmd + s, cmd + r
        return false;
    }

    enable(cb = f => f) {
        this.enabled = true;
        this.listener = cb;
        this.combos.forEach(combo => {
            hotkeys(combo, DEFAULT_OPTIONS, this.handler);
        });
    }

    disable() {
        this.enabled = false;
        this.listener = undefined;
        this.combos.forEach(combo => {
            hotkeys.unbind(combo);
        });
    }

    isPressed(key) {
        return hotkeys.isPressed(key);
    }
}
