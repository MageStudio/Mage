import BaseScript from './BaseScript';
import Input from '../core/input/Input';
import { fetch } from 'whatwg-fetch';
import Assets from "../core/Assets";

export class Scripts {

	constructor() {
		this.scripts = {};
	}

	update() {}

	load = () => {
        const keys = Object.keys(Assets.scripts());

        if (!keys.length) {
            return Promise.resolve('scripts');
        }

        return Promise.all(keys.map(this.loadSingleScript));
    }

    loadSingleScript = (id) => {
        const path = Assets.scripts()[id];

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
		this.scripts[id] = ScriptClass;
	}

	get(id) {
		const ScriptClass = this.scripts[id];

		if (ScriptClass) {
			return new ScriptClass();
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
