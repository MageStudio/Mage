import ScriptManager from '../scripts/ScriptManager';
import Sound from '../audio/Sound';
import DirectionalSound from '../audio/DirectionalSound';
import AmbientSound from '../audio/AmbientSound';
import BaseScript from '../scripts/BaseScript';
import Between from 'between.js';

import SceneManager from '../base/SceneManager';

export default class Entity {

	constructor({ serializable = true }) {
		this.scripts = [];
		this.serializable = serializable;
	}

	start() {
		if (this.hasScripts()) {
			this.scripts.forEach(({ script, enabled }) => {
				if (enabled) {
					script.start(this);
				}
			});
		}
	}

	update(dt) {
		return new Promise((resolve) => {
			if (this.hasScripts()) {
				this.scripts.forEach(({ script, enabled }) => {
					if (enabled) {
						script.update(dt);
					}
				});
			}
			resolve();
		});
	}

	dispose() {
		if (this.mesh) {
			SceneManager.remove(this.mesh);
			this.mesh.material.dispose();
			this.mesh.geometry.dispose();
		}
	}

	hasScripts = () => this.scripts.length > 0;

	setScripts(scripts = [], enabled = true) {
		this.scripts = scripts.map(name => ({
			script: ScriptManager.get(name),
			enabled
		}));
	}

	addScript(name, enabled = true) {
		const script = ScriptManager.get(name);
		if (script) {
			this.scripts.push({
				script,
				enabled
			})
		}
	}

	enableScripts() {
		this.scriptsEnabled = true;
	}

	disableScripts() {
		this.scriptsEnabled = false;
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
		const { x, y, z } = this.position;

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

	get scale() {
		return (this.mesh) ? {
			x: this.mesh.scale.x,
			y: this.mesh.scale.y,
			z: this.mesh.scale.z
		} : {
			x: 1,
			y: 1,
			z: 1
		};
	}

	set scale({ x, y, z }) {
		const scale = {
			x: isUndefined(x) ? this.mesh.scale.x : x,
			y: isUndefined(y) ? this.mesh.scale.y : y,
			z: isUndefined(z) ? this.mesh.scale.z : z
		}

		if (this.mesh) {
			this.mesh.scale.set(scale.x, scale.y, scale.z);
		} else {
			console.warn('[Mage] Missing mesh, cannot apply scale.');
		}
	}

	get rotation() {
		return (this.mesh) ? {
			x: this.mesh.rotation.x,
			y: this.mesh.rotation.y,
			z: this.mesh.rotation.z
		} : {
			x: 1,
			y: 1,
			z: 1
		};
	}

	set rotation({ x, y, z }) {
		const rotation = {
			x: isUndefined(x) ? this.mesh.rotation.x : x,
			y: isUndefined(y) ? this.mesh.rotation.y : y,
			z: isUndefined(z) ? this.mesh.rotation.z : z
		}

		if (this.mesh) {
			this.mesh.rotation.set(rotation.x, rotation.y, rotation.z);
		} else {
			console.warn('[Mage] Missing mesh, cannot apply rotation.');
		}
	}

	get position() {
		return (this.mesh) ? {
			x: this.mesh.position.x,
			y: this.mesh.position.y,
			z: this.mesh.position.z
		} : {
			x: 1,
			y: 1,
			z: 1
		};
	}

	set position({ x, y, z }) {
		const position = {
			x: isUndefined(x) ? this.mesh.position.x : x,
			y: isUndefined(y) ? this.mesh.position.y : y,
			z: isUndefined(z) ? this.mesh.position.z : z
		}

		if (this.mesh) {
			this.mesh.position.set(position.x, position.y, position.z);
		} else {
			console.warn('[Mage] Missing mesh, cannot apply position.');
		}
	}

	goTo(position, time) {
		const { x, y, z } = this.position;

		return new Promise((resolve) => {
			return new Between({ x, y, z}, position)
				.time(time)
				.on('update', value => this.position = value)
				.on('complete', resolve);
		});
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

	setName(name, { replace = false } = {}) {
		if (name && this.mesh) {
			if (replace) this.dispose();

			this.name = name;
			this.mesh.name = name;

			if (replace) SceneManager.add(this.mesh, this, true);
		}
	}

	add(mesh) {
		if (this.mesh) {
			this.mesh.add(mesh.mesh);
		}
	}
}
