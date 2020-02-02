import {
	Vector3
} from 'three';
import AssetsManager from '../base/AssetsManager';
import SceneManager from '../base/SceneManager';

export class AudioEngine {

	constructor() {
		this.DELAY_FACTOR = 0.02;
		this.DELAY_STEP = 1; //millis
		this.DELAY_MIN_VALUE = 0.2;
		this.DELAY_NORMAL_VALUE = 40;
		this.VOLUME = 80;
		this._volume = 80;

		this.soundPath = "js/core/sound/";
		this.soundModules = [
			"js/core/audio/beat", //parent
			"js/core/audio/sound",
			"js/core/audio/ambientSound"
		];

		this.numSound = 0;
		this.soundLoaded = 0;
	}

	getVolume() {
		if (this._volume) {
			return this._volume;
		}
	}

	setVolume(value) {
		this._volume = value;
		this.volume.gain.value = this._volume;
	}

	load = () => {
		this.map = {};
		this.sounds = [];

		if (!window) {
			return Promise.resolve('audio');
		}

		this.AudioContext = window.AudioContext || window.webkitAudioContext || null;

		if (this.AudioContext) {
			//creating a new audio context if it's available.
			this.context = new this.AudioContext();
			//creating a gain node to control volume
			this.volume = this.context.createGain();
			this.volume.gain.value = this.VOLUME;
			//connecting volume node to context destination
			this.volume.connect(this.context.destination);
		} else {
			console.error("No Audio Context available, sorry.");
		}

		if (Object.keys(AssetsManager.audio()).length === 0) {
			return Promise.resolve('audio');
		}

		return Promise
			.all(Object
				.keys(AssetsManager.audio())
				.map(this.loadSingleFile)
			);
	}

	get(id) {
		//returning stored buffer;
		return this.map[id] || false;
	}

	loadSingleFile = (id) => {
		const path = AssetsManager.audio()[id];
		// Load a sound file using an ArrayBuffer XMLHttpRequest.
		const request = new XMLHttpRequest();
		return new Promise(resolve => {
			request.open("GET", path, true);
			request.responseType = "arraybuffer";
			request.onreadystatechange = (e) => {
				if (request.readyState === 4 && request.status === 200) {
					this.context.decodeAudioData(request.response,
						(buffer) => {
							this.map[id] = buffer;
							resolve();
						},
						() => {
							this.map[id] = null;
							resolve();
							console.error("Decoding the audio buffer failed");
						});
				} else if (request.readyState === 4 && request.status === 200) {
					resolve();
				}
			};
			request.send();
		})
	}

	add(sound) {
		this.sounds.push(sound);
	}

	update(dt) {
		const start = new Date();
		for (var index in this.sounds) {
			var sound = this.sounds[index];
			sound.update(dt);

			//now handling listener
			SceneManager.camera.object.updateMatrixWorld();
			var p = new Vector3();
			p.setFromMatrixPosition(SceneManager.camera.object.matrixWorld);

			//setting audio engine context listener position on camera position
			this.context.listener.setPosition(p.x, p.y, p.z);


			//this is to add up and down vector to our camera
			// The camera's world matrix is named "matrix".
			var m = SceneManager.camera.object.matrix;

			const mx = m.elements[12], my = m.elements[13], mz = m.elements[14];
			m.elements[12] = m.elements[13] = m.elements[14] = 0;

			// Multiply the orientation vector by the world matrix of the camera.
			var vec = new Vector3(0,0,1);
			vec.applyMatrix4(m);
			vec.normalize();

			// Multiply the up vector by the world matrix.
			var up = new Vector3(0,-1,0);
			up.applyMatrix4(m);
			up.normalize();

			// Set the orientation and the up-vector for the listener.
			this.context.listener.setOrientation(vec.x, vec.y, vec.z, up.x, up.y, up.z);

			m.elements[12] = mx;
			m.elements[13] = my;
			m.elements[14] = mz;

			if ((+new Date() - start) > 50) return;
		}
	}
}

export default new AudioEngine();
