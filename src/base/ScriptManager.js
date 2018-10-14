import { include } from './util';

export class ScriptManager {

	constructor() {
		this.scripts = {};
	}

	get SCRIPTS_DIR() {
		return 'app/scripts/';
	}

	update() {}

	create(name, methods) {
		const obj = {};
		obj.name = name;
		for (var method in methods) {
			obj[method] = methods[method];
		}
		if (!obj.start) {
			obj.start = new Function("console.warn('You need a start method');");
		}
		if (!obj.update) {
			obj.update = new Function("console.warn('You need an update method');");
		}

		if (!(name in this.scripts)) {
			this.scripts[name] = obj;
		}
	}

	attachScript(object, script, dir) {
		const path = dir + script;
		include(path, function() {
			object.__loadScript(this.scripts[script]);
		});
	}
}

export default new ScriptManager();
