import Between from 'between.js';
import { createMachine, interpret } from 'xstate';
import { EventDispatcher } from 'three';

import ScriptManager from '../scripts/ScriptManager';
import Sound from '../audio/Sound';
import DirectionalSound from '../audio/DirectionalSound';
import AmbientSound from '../audio/AmbientSound';
import SceneManager from '../base/SceneManager';

const STATE_CHANGE_EVENT = { type: 'stateChange' };

export default class Entity extends EventDispatcher {

	constructor({ serializable = true }) {
		super();
		this.scripts = [];
		this.serializable = serializable;
	}

	reset() {
		this.scripts = [];
	}

	stopScripts() {
		if (this.hasScripts()) {
			this.scripts.forEach(({ script, enabled }) => {
				if (enabled) {
					script.onDispose();
					script.__hasStarted(false);
				}
			});
		}
	}

	start() {
		if (this.hasScripts()) {
			this.scripts.forEach(({ script, enabled }) => {
				if (enabled) {
					script.start(this);
					script.__hasStarted(true);
				}
			});
		}
	}

	update(dt) {
		return new Promise((resolve) => {
			if (this.hasScripts()) {
				this.scripts.forEach(({ script, enabled }) => {
					if (script && enabled) {
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
			// stopping state machine
			this.stopStateMachine();
			// stopping all scripts now
			this.stopScripts();
			this.reset();
		}
	}

	hasStateMachine = () => !!this.stateMachine;

	addStateMachine(description) {
		this.stateMachine = interpret(createMachine(description))
			.onTransition(state => {
				this.dispatchEvent({
					STATE_CHANGE_EVENT,
					state
				});
			});

		if (description.autostart) {
			this.startStateMachine();
		}
	}

	startStateMachine() {
		if (this.hasStateMachine()) {
			this.stateMachine.start();
		}
	}

	stopStateMachine() {
		if (this.hasStateMachine()) {
			this.stateMachine.stop();
		}
	}

	changeState(event) {
		if (this.hasStateMachine()) {
			this.stateMachine.send(event);
		}
	}

	hasScripts = () => this.scripts.length > 0;

	startScript(scriptName) {
		const script = this.scripts.filter(({ name }) => name === scriptName)[0];

		if (script) {
			script.start(this);
		} else {
			console.error('[Mage] Could not find desired script');
		}
	}

	setScripts(scripts = [], enabled = true) {
		this.scripts = scripts.map(name => ({
			script: ScriptManager.get(name),
			enabled
		}));

		if (enabled) {
			this.start();
		}
	}

	addScripts(scripts = [], enabled = true) {
		const parsedScripts = scripts.map(name => ({
			script: ScriptManager.get(name),
			name,
			enabled
		}));

		this.scripts = [
			...this.scripts,
			parsedScripts
		];

		if (enabled) {
			parsedScripts.forEach(({ name }) => this.startScript(name));
		}
	}

	addScript(name, enabled = true) {
		const script = ScriptManager.get(name);
		if (script) {
			this.scripts.push({
				script,
				name,
				enabled
			});
			if (enabled) {
				script.start(this);
			}
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
		const { autoplay = false, ...opts } = options;

		this.isPlayingSound = autoplay;
		this.sound = new Sound(name, {
			mesh: this.mesh,
			autoplay,
			...opts
		});

		return this.sound;
	}

	addDirectionalSound(name, options) {
		const { autoplay = false, ...opts } = options;

		this.isPlayingSound = autoplay;
		this.sound = new DirectionalSound(name, {
			mesh: this.mesh,
			autoplay,
			...opts
		});

		return this.sound;
	}

	addAmbientSound(name, options) {
		const { autoplay = false, ...opts } = options;

		this.isPlayingSound = autoplay;
		this.sound = new AmbientSound(name, {
			mesh: this.mesh,
			autoplay,
			...opts
		});

		return this.sound;
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
			z: options.z === undefined ? this.mesh.scale.z : options.z
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
			z: options.z === undefined ? this.mesh.position.z : options.z
		};

		// if we're using physics, send message to worker

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
			z: options.z === undefined ? this.mesh.rotation.z : options.z
		};

		if (this.mesh) {
			this.mesh.rotation.set(rotation.x, rotation.y, rotation.z);
		}
	}

	translate({ x = 0, y = 0, z = 0}) {
		if (this.mesh) {
			this.mesh.translateX(x);
			this.mesh.translateY(y);
			this.mesh.translateZ(z);
		}
	}

	goTo(position, time) {
		const { x, y, z } = this.position();

		return new Promise((resolve) => {
			return new Between({ x, y, z}, position)
				.time(time)
				.on('update', value => this.position(value))
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
}
