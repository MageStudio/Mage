import BaseScript from './BaseScript';

export class ScriptManager {

	constructor() {
		this.scripts = {};
	}

	update() {}

	set(id, script) {
		this.scripts[id] = script;
	}

	get(id) {
		return this.scripts[id] || {};
	}

	parseScript(content) {
		// does this mean we can send whatever we want down to the script?
		return new Function('Script', 'return ' + content + ';')(BaseScript);
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
			console.error('[Mage] Script needs to be an instance of Script.');
		}
	}
}

export default new ScriptManager();
