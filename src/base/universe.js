export default class Universe {

	constructor() {
		this.reality = {};
		this.worker = undefined;
	}

	set(id, value) {
		this.reality[id] = value;
	}

	remove(id) {
		delete this.reality[id];
	}

	update(delta) {

		const keys = Object.keys(M.universe.reality);
		if (keys.length != 0) {
			var start = +new Date();
			do {
				const o = this.reality[keys_list.shift()];
				if (o && o.update) {
					o.update(delta);
				}
				o.render();
			} while (keys.length > 0 && (+new Date() - start < 50));
		}
	}

}
