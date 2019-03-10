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
		const position = {
			x: this.mesh.position.x,
			y: this.mesh.position.y,
			z: this.mesh.position.z
		}
		this.light.setPosition(position);
		this.addMesh(this.light.mesh.mesh);
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

		const _x = options.x || 1,
			_y = options.y || 1,
			_z = options.z || 1;

		if (this.mesh) {
			this.mesh.scale.set(_x, _y, _z);
		}
	}

	position(options) {
		if (options === undefined) return {
			x: this.mesh.position.x,
			y: this.mesh.position.y,
			z: this.mesh.position.z
		}

		const _x = options.x || this.mesh.position.x,
			_y = options.y || this.mesh.position.y,
			_z = options.z || this.mesh.position.z;

		if (this.mesh) {
			this.mesh.position.set(_x, _y, _z);
		}
	}

	rotation(options) {
		if (options === undefined) return {
			x: this.mesh.rotation.x,
			y: this.mesh.rotation.y,
			z: this.mesh.rotation.z
		}

		const _x = options.x || this.mesh.rotation.x,
			_y = options.y || this.mesh.rotation.y,
			_z = options.z || this.mesh.rotation.z;

		if (this.mesh) {
			this.mesh.rotation.set(_x, _y, _z);
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
