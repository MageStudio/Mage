export class Universe {

	constructor() {
		this.reality = {};
		this.worker = undefined;
	}

	get(id) {
		return this.reality[id];
	}

	set(id, value) {
		this.reality[id] = value;
	}

	remove(id) {
		delete this.reality[id];
	}

	update(delta) {
		const keys = Object.keys(this.reality);
		if (keys.length !== 0) {
			const start = +new Date();
			do {
				const o = this.reality[keys.shift()];

				o.update && o.update(delta);
				o.render && o.render(delta);

			} while (keys.length > 0 && (+new Date() - start < 50));
		}
	}

	toJSON() {
		return {
			meshes: Object.keys(this.reality).map(k => this.get(k).toJSON())
		}
	}
}

export default new Universe();
