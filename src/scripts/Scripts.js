import BaseScript from './BaseScript';
import Input from '../core/input/Input';
import { fetch } from 'whatwg-fetch';
import BaseCar from './builtin/BaseCar';
import SmoothCarFollow from './builtin/SmoothCarFollow';
import { DEPRECATIONS } from '../lib/messages';

export const BUILTIN = {
    BASECAR: 'BaseCar',
    TRAILS: 'Trails',
    SMOOTH_CAR_FOLLOW: 'SmoothCarFollow'
};
export class Scripts {

    constructor() {
        this.map = {
            [BUILTIN.BASECAR] : BaseCar,
            [BUILTIN.SMOOTH_CAR_FOLLOW]: SmoothCarFollow
        };
    }

    get BUILTIN() {
        return BUILTIN;
    }

    update() {}

    load = (scripts, level) => {
        this.scripts = scripts;
        const keys = Object.keys(scripts);

        if (!keys.length) {
            return Promise.resolve('scripts');
        }

        return Promise.all(keys.map(name => this.loadSingleScript(name, level)));
    }

    loadSingleScript = (name, level) => {
        const path = this.scripts[name];

        return new Promise(resolve => {

            fetch(path)
                .then(response => response.text())
                .then((text) => {
                    this.createFromString(text);
                    resolve();
                });
        });
    }

    set(id, ScriptClass) {
        this.map[id] = ScriptClass;
    }

    get(name) {
        const ScriptClass = this.map[name];

        if (ScriptClass) {
            return new ScriptClass(name);
        }

        return false;
    }

    parseScript(content) {
        // does this mean we can send whatever we want down to the script?
        return new Function('Script', 'Input', 'return ' + content + ';')(BaseScript, Input);
    }

    createFromString(stringContent) {
        const Script = this.parseScript(stringContent);
        const s = new Script();

        this.set(s.name(), s);
        return s;
    }

    create(name, ScriptClass) {
        console.warn(DEPRECATIONS.SCRIPTS_CREATE);
        this.register(name, ScriptClass);
    }

    register(name, ScriptClass) {
        if (ScriptClass) {
            const script = new ScriptClass();
            if (script.__check && script.__check()) {
                this.set(name, ScriptClass);
            } else {
                console.error('[Mage] Script:', name, 'needs to be an instance of Script.');
            }
        } else {
            console.error('[Mage] Script not provided.');
        }
    }
}

export default new Scripts();
