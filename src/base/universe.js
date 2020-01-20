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
		return new Promise(resolve => {
			Promise
				.all(keys.map(k => {
					const o = this.reality[k];
					o.update(delta);
				}))
				.then(resolve)
		});
	}

	toJSON() {
		const meshes = Object.keys(this.reality)
			.map(k => this.get(k))
			.filter(m => m.serializable)
			.map(m => m.toJSON());

		return { meshes }
	}
}

export default new Universe();
