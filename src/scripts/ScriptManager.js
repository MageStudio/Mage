import BaseScript from './BaseScript';
import Input from '../base/input/Input';
import { fetch } from 'whatwg-fetch';
import AssetsManager from "../base/AssetsManager";

export class ScriptManager {

	constructor() {
		this.scripts = {};
	}

	update() {}

	load = () => {
        const keys = Object.keys(AssetsManager.scripts());

        if (!keys.length) {
            return Promise.resolve('scripts');
        }

        return Promise.all(keys.map(this.loadSingleScript));
    }

    loadSingleScript = (id) => {
        const path = AssetsManager.scripts()[id];

        return new Promise(resolve => {

            fetch(path)
                .then(response => response.text())
                .then((text) => {
                    this.createFromString(text);
                    resolve();
                });
        });
    }

	set(id, script) {
		this.scripts[id] = script;
	}

	get(id) {
		return this.scripts[id] || false;
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

	create(name, script = {}) {
		if (script instanceof BaseScript) {
			this.set(name, script);
			return script;
		} else {
			console.error('[Mage] Script: ', name ,' needs to be an instance of Script.');
		}
	}
}

export default new ScriptManager();
