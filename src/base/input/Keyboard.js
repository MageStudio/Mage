import hotkeys from 'hotkeys-js';

export default class Keyboard {

    constructor() {
        this.keys = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'l', 'k', 'j', 'h', 'g', 'f', 'd', 's', 'a', 'z', 'x', 'c', 'v', 'b', 'n', 'm'];
        this.specials = ['esc', 'escape', 'enter'];
        this.symbols = [];

        this.combos = [
            ...this.keys,
            ...this.specials,
            ...this.symbols
        ];

        this.enabled = false;
        this.listener = undefined;
    }

    register(combo) {
        if (this.enabled) {
            if (this.combos.includes(combo)) {
                console.warn('[Mage] Combo already registered');
                return;
            }
            this.combos.push(combo);
            hotkeys(combo, this.handler);
        }
    }

    handler = (event, handler) => {
        if (!this.enabled) return;
        console.log('dispatching keypress');
        this.listener(event);
    }

    enable(cb = f => f) {
        this.enabled = true;
        this.listener = cb;
        this.combos.forEach(combo => {
            hotkeys(combo, this.handler);
        });
    }

    disable() {
        this.enabled = false;
        this.listener = undefined;
        this.combos.forEach(combo => {
            hotkeys.unbind(combo);
        });
    }
}
