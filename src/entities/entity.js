import ScriptManager from '../scripts/ScriptManager';
import Sound from '../audio/Sound';
import DirectionalSound from '../audio/DirectionalSound';
import AmbientSound from '../audio/AmbientSound';
// import { LightPoint } from '../lights/LightPoint';

export default class Entity {

	constructor() {}

	start() {
		this.script && this.script.start.call(this);
	}

	update(dt) {
		this.script && this.script.update.call(this, dt);
	}

	render() {
		if (this.mesh && this.mesh.render) {
			this.mesh.render();
		}
	}

	addScript(name, enabled = true) {
		this.script = ScriptManager.get(name);

		try {
			if (enabled) {
				this.start();
			}
		} catch(e) {
			console.log("Check your start method inside your " + name + ".js script");
		}
	}

	setMesh() {
		this._isMesh = true;
		this._isLight = false;
		this._isModel = false;
	}

	setLight() {
		this._isMesh = false;
		this._isLight = true;
		this._isModel = false;
	}

	setModel() {
		this._isMesh = false;
		this._isLight = false;
		this._isModel = true;
	}


	isMesh() { return this._isMesh; }
	isLight() { return this._isLight; }
	isModel() { return this._isModel; }

	addSound(name, options) {
		const _autoplay = options.autoplay || false;
		this.isPlayingSound = _autoplay;
		this.sound = new Sound(name, {
			mesh: this.mesh,
			autoplay: _autoplay,
			effect: options.effect
		});
	}

	addDirectionalSound(name, options) {
		const _autoplay = options.autoplay || false;
		this.isPlayingSound = _autoplay;
		this.sound = new DirectionalSound(name, {
			mesh: this.mesh,
			autoplay: _autoplay,
			effect: options.effect
		});
	}

	addAmbientSound(name, options) {
		const _autoplay = options.autoplay || false;
		const _loop = options.loop || false;
		this.isPlayingSound = _autoplay;
		this.sound = new AmbientSound(name, {
			mesh: this.mesh,
			autoplay: _autoplay,
			loop: _loop,
			effect: options.effect
		});
	}

	addLight(light) {
		const { x, y, z } = this.position();

		light.position({ x, y, z });
		this.light = light;
	}

	playSound() {
		if (this.sound && !this.isPlayingSound) {
			this.sound.start();
			this.isPlayingSound = true;
		}
	}

	stopSound() {
		if (this.sound && this.isPlayingSound ) {
			this.sound.stop();
			this.isPlayingSound = false;
		}
	}

	scale(options) {
		if (options === undefined) return {
			x: this.mesh.scale.x,
			y: this.mesh.scale.y,
			z: this.mesh.scale.z
		};

		const scale = {
			x: options.x === undefined ? this.mesh.scale.x : options.x,
			y: options.y === undefined ? this.mesh.scale.y : options.y,
			z: options.x === undefined ? this.mesh.scale.z : options.z
		};

		if (this.mesh) {
			this.mesh.scale.set(scale.x, scale.y, scale.z);
		}
	}

	position(options) {
		if (options === undefined) return {
			x: this.mesh.position.x,
			y: this.mesh.position.y,
			z: this.mesh.position.z
		};

		const position = {
			x: options.x === undefined ? this.mesh.position.x : options.x,
			y: options.y === undefined ? this.mesh.position.y : options.y,
			z: options.x === undefined ? this.mesh.position.z : options.z
		};

		if (this.mesh) {
			this.mesh.position.set(position.x, position.y, position.z);
		}
	}

	rotation(options) {
		if (options === undefined) return {
			x: this.mesh.rotation.x,
			y: this.mesh.rotation.y,
			z: this.mesh.rotation.z
		};

		const rotation = {
			x: options.x === undefined ? this.mesh.rotation.x : options.x,
			y: options.y === undefined ? this.mesh.rotation.y : options.y,
			z: options.x === undefined ? this.mesh.rotation.z : options.z
		};

		if (this.mesh) {
			this.mesh.rotation.set(rotation.x, rotation.y, rotation.z);
		}
	}

	uuid(uuid) {
		if (uuid && this.mesh) {
			this.mesh.uuid = uuid;
		} else {
			return this.mesh.uuid;
		}
	}

	equals(element) {
		try {
			return element.uuid ? this.uuid() === element.uuid() : false;
		} catch(e) {
			return false;
		}
	}

	name(name) {
		if (name && this.mesh) {
			this.mesh.name = name;
		} else {
			return this.mesh.name;
		}
	}

	add(mesh) {
		if (this.mesh) {
			this.mesh.add(mesh.mesh);
		}
	}
}
