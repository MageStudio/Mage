import {
	Vector3
} from 'three';
import Scene from '../base/Scene';

const TIME_FOR_UPDATE = 150;

export class Audio {

	constructor() {
		this.DELAY_FACTOR = 0.02;
		this.DELAY_STEP = 1; //millis
		this.DELAY_MIN_VALUE = 0.2;
		this.DELAY_NORMAL_VALUE = 40;
		this.VOLUME = 20;
		this._volume = 20;

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

	load = (audio) => {
		this.map = {};
		this.sounds = [];
		this.audio = audio;

		if (!window) {
			return Promise.resolve('audio');
		}

		this.AudioContext = window.AudioContext || window.webkitAudioContext || null;

		if (this.AudioContext) {
			//creating a new audio context if it's available.
			this.context = new this.AudioContext();
			//creating a gain node to control volume
			this.volume = this.context.createGain();
			this.volume.gain.value = this.getVolume();
			//connecting volume node to context destination
			this.volume.connect(this.context.destination);
		} else {
			console.error("No Audio Context available, sorry.");
		}

		if (Object.keys(this.audio).length === 0) {
			return Promise.resolve('audio');
		}

		return Promise
			.all(Object
				.keys(this.audio)
				.map(this.loadSingleFile)
			);
	}

	get(id) {
		return this.map[id] || false;
	}

	loadSingleFile = (id) => {
		const path = this.audio[id];
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
				}
			};
			request.send();
		})
	}

	add(sound) {
		this.sounds.push(sound);
	}

	update(dt) {
		return new Promise(resolve => {
			const start = new Date();
			for (var index in this.sounds) {
				const sound = this.sounds[index];
				sound.update(dt);

				//now handling listener
				Scene.getCameraObject().updateMatrixWorld();
				const p = new Vector3();
				p.setFromMatrixPosition(Scene.getCameraObject().matrixWorld);

				//setting audio engine context listener position on camera position
				this.context.listener.setPosition(p.x, p.y, p.z);

				//this is to add up and down vector to our camera
				// The camera's world matrix is named "matrix".
				const m = Scene.getCameraObject().matrix;

				const mx = m.elements[12], my = m.elements[13], mz = m.elements[14];
				m.elements[12] = m.elements[13] = m.elements[14] = 0;

				// Multiply the orientation vector by the world matrix of the camera.
				const vec = new Vector3(0,0,1);
				vec.applyMatrix4(m);
				vec.normalize();

				// Multiply the up vector by the world matrix.
				const up = new Vector3(0,-1,0);
				up.applyMatrix4(m);
				up.normalize();

				// Set the orientation and the up-vector for the listener.
				this.context.listener.setOrientation(vec.x, vec.y, vec.z, up.x, up.y, up.z);

				m.elements[12] = mx;
				m.elements[13] = my;
				m.elements[14] = mz;

				if ((+new Date() - start) > TIME_FOR_UPDATE) break;
			}

			resolve();
		});
	}
}

export default new Audio();
