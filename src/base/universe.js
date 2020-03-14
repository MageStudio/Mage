export class Universe {

	constructor() {
		this.reality = {};
		this.realityUUID = {};
		this.worker = undefined;
	}

	get(id) {
		return this.reality[id];
	}

	getByUUID(uuid) {
		const id = this.realityUUID[uuid];

		if (id) {
			return this.get(id);
		}
	}

	set(id, value) {
		this.realityUUID[value.uuid] = id;
		this.reality[id] = value;
	}

	remove(id) {
		delete this.reality[id];
	}

	forEach = (callback) => {
		const keys = Object.keys(this.reality);

		keys.forEach(k => callback(this.reality[k]));
	};

	forEachAsync = (callback) => {
		const keys = Object.keys(this.reality);

		return new Promise(resolve => {
			Promise
				.all(keys.map(k => callback(this.reality[k])))
				.then(resolve);
		});
	};

	// update(delta) {
	// 	return this.forEachAsync(o => o.update(delta));
	// }

	update(delta) {
		Object
			.keys(this.reality)
			.map(k => this.reality[k].update(delta))
		/*
		return new Promise(resolve => {
			Promise
				.all(keys.map(k => {
					const o = this.reality[k];
					o.update(delta);
				}))
				.then(resolve)
		});*/
	}

	bigfreeze = () => {
		this.forEach(o => o.dispose());
	}

	toJSON() {
		const meshes = Object.keys(this.reality)
			.map(k => this.get(k))
			.filter(m => m.serializable && m.isMesh())
			.map(m => m.toJSON());

		return { meshes }
	}
}

export default new Universe();
