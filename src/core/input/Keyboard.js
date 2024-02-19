import hotkeys from "hotkeys-js";
import { KEYBOARD_COMBO_ALREADY_REGISTERED, KEYBOARD_COMBO_IS_INVALID } from "../../lib/messages";

import { EventDispatcher } from "three";

const HOTKEYS_DEFAULT_OPTIONS = {
    keyup: true,
    keydown: true,
};

const COMBINATION_DIVIDER = ",";

export const KEY_PRESS = "keyPress";
export const KEY_DOWN = "keyDown";
export const KEY_UP = "keyUp";
export const KEY_COMBO = "keyCombo";
export default class Keyboard extends EventDispatcher {
    constructor() {
        super();

        this.combos = [];

        this.enabled = false;
    }

    listenTo(combos = []) {
        if (this.enabled) {
            if (!(combos instanceof Array) || !combos.length) {
                console.warn(KEYBOARD_COMBO_IS_INVALID);
            }
            const parsedCombos = combos.join(COMBINATION_DIVIDER);

            hotkeys(parsedCombos, HOTKEYS_DEFAULT_OPTIONS, this.handleCombo);
        }
    }

    handleCombo = event => {
        this.dispatchEvent({
            type: KEY_COMBO,
            event,
        });
    };

    handleKeydown = event => {
        this.dispatchEvent({
            type: KEY_DOWN,
            event,
        });
    };

    handleKeyup = event => {
        this.dispatchEvent({
            type: KEY_UP,
            event,
        });
    };

    handleKeypress = event => {
        this.dispatchEvent({
            type: KEY_PRESS,
            event,
        });
    };

    enable(options = {}) {
        this.enabled = true;

        if (options.combos) {
            this.listenTo(options.combos);
        }

        window.addEventListener(KEY_DOWN.toLowerCase(), this.handleKeydown.bind(this));
        window.addEventListener(KEY_UP.toLowerCase(), this.handleKeyup.bind(this));
        window.addEventListener(KEY_PRESS.toLowerCase(), this.handleKeypress.bind(this));
    }

    disable() {
        this.enabled = false;

        hotkeys.unbind();
        window.removeEventListener(KEY_DOWN.toLowerCase(), this.handleKeydown.bind(this));
        window.removeEventListener(KEY_UP.toLowerCase(), this.handleKeyup.bind(this));
        window.removeEventListener(KEY_PRESS.toLowerCase(), this.handleKeypress.bind(this));
    }

    isPressed(key) {
        console.log(key, hotkeys.getPressedKeyCodes());
        return hotkeys.isPressed(key);
    }
}
