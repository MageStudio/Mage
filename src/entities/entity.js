import Between from 'between.js';
import { createMachine, interpret } from 'xstate';
import { EventDispatcher, Quaternion, Euler, Vector3 } from 'three';

import Config from '../base/config';
import Scripts from '../scripts/Scripts';
import Sound from '../audio/Sound';
import DirectionalSound from '../audio/DirectionalSound';
import AmbientSound from '../audio/AmbientSound';
import Scene from '../base/Scene';
import Physics from '../physics/physics';

const STATE_CHANGE_EVENT = { type: 'stateChange' };
const DEFAULT_POSITION =  { x: 0, y: 0, z: 0 };
const DEFAULT_ANGULAR_VELOCITY = { x: 0, y: 0, z: 0 };
const DEFAULT_LINEAR_VELOCITY = { x: 0, y: 0, z: 0 };

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
			Scene.remove(this.mesh);
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
			script: Scripts.get(name),
			enabled
		}));

		if (enabled) {
			this.start();
		}
	}

	addScripts(scripts = [], enabled = true) {
		const parsedScripts = scripts.map(name => ({
			script: Scripts.get(name),
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

	addScript(name, enabled = true, options) {
		const script = Scripts.get(name);
		if (script) {
			this.scripts.push({
				script,
				name,
				enabled
			});
			if (enabled) {
				script.start(this, options);
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
		const { x, y, z } = this.getPosition();

		light.setPosition({ x, y, z });
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

	getScale() {
		return {
			x: this.mesh.scale.x,
			y: this.mesh.scale.y,
			z: this.mesh.scale.z
		};
	}

	setScale(howbig) {
		const scale = {
			...this.getScale(),
			...howbig
		};

		if (this.mesh) {
			this.mesh.scale.set(scale.x, scale.y, scale.z);
		}
	}

	getWorldPosition() {
		const vector = new Vector3();
		if (this.mesh) {
			const { x, y, z } = this.mesh.getWorldPosition(vector);
			
			return { x, y, z }
		}

		return DEFAULT_POSITION;
	}

	getPosition() {
		return {
			x: this.mesh.position.x,
			y: this.mesh.position.y,
			z: this.mesh.position.z
		};
	}

	setPosition(where) {
		const position = {
			...this.getPosition(),
			...where
		};

		if (Config.physics().enabled) {
			Physics.updatePosition(this.uuid(), position);
		} else if (this.mesh) {
			this.mesh.position.set(position.x, position.y, position.z);
		}
	}

	getRotation() {
		return {
			x: this.mesh.rotation.x,
			y: this.mesh.rotation.y,
			z: this.mesh.rotation.z
		};
	}

	setRotation(how) {
		const rotation = {
			...this.getRotation(),
			...how
		};

		if (Config.physics().enabled) {
			Physics.updateRotation(this.uuid(), rotation);
		} else if (this.mesh) {
			this.mesh.rotation.set(rotation.x, rotation.y, rotation.z);
		}
	}

	getAngularVelocity() {
		return this.angularVelocity || DEFAULT_ANGULAR_VELOCITY;
	}

	setAngularVelocity(velocity) {
		this.angularVelocity = velocity;
		Physics.updateAngularVelocity(this.uuid(), velocity);
	}

	getLinearVelocity() {
		return this.linearVelocity || DEFAULT_LINEAR_VELOCITY;
	}

	setLinearVelocity(velocity) {
		this.linearVelocity = velocity;
		Physics.updateLinearVelocity(this.uuid(), velocity);
	}

	translate({ x = 0, y = 0, z = 0}) {
		if (this.mesh) {
			this.mesh.translateX(x);
			this.mesh.translateY(y);
			this.mesh.translateZ(z);
		}
	}

	goTo(position, time) {
		const { x, y, z } = this.getPosition();

		return new Promise((resolve) => 
			new Between({ x, y, z}, position)
				.time(time)
				.on('update', value => this.position(value))
				.on('complete', resolve)
		);
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

			if (replace) Scene.add(this.mesh, this, true);
		}
	}
}
