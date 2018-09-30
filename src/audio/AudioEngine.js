export default class AudioEngine {

	constructor(assetsManager) {
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

		this.assetsManager = assetsManager;
	}

	get VOLUME() {
		if (this._volume) {
			return this._volume;
		}
	}

	set VOLUME(value) {
		this._volume = value;
		this.volume.gain.value = this._volume;
	}

	load() {
		this.map = {};
		this.sounds = [];

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

		for (var audio in Assets.Audio) {
			this.numSound++;
			this.loadSingleFile(audio, Assets.Audio[audio]);
		}

		if (this.numSound == 0) {
			this.assetsManager.completed.sound = true;
		}
	}

	get(id) {
		//returning stored buffer;
		return M.audioEngine.map[id] || false;
	}

	loadSingleFile(id, path) {
		// Load a sound file using an ArrayBuffer XMLHttpRequest.
		const request = new XMLHttpRequest();
		request.open("GET", path, true);
		request.responseType = "arraybuffer";
		request.onload = (e) => {
			this.context.decodeAudioData(this.response,
				(buffer) => {
					this.map[id] = buffer;
					this.soundLoaded++;
					this.checkLoad();
				},
				() => {
					this.map.put[id] = null;
					this.soundLoaded++;
					console.error("Decoding the audio buffer failed");
				});

		};
		request.send();
	}

	checkLoad() {
		if (this.soundLoaded == this.numSound) {
			this.assetsManager.completed.sound = true;
		}
	}

	add(sound) {
		this.sounds.push(sound);
	}

	update() {
		const start = new Date();
		for (var index in this.sounds) {
			var sound = this.sounds[index];
			sound.update(app.clock.getDelta());

			//now handling listener
			app.camera.object.updateMatrixWorld();
			var p = new THREE.Vector3();
			p.setFromMatrixPosition(app.camera.object.matrixWorld);

			//setting audio engine context listener position on camera position
			this.context.listener.setPosition(p.x, p.y, p.z);


			//this is to add up and down vector to our camera
			// The camera's world matrix is named "matrix".
			var m = app.camera.object.matrix;

			mx = m.elements[12], my = m.elements[13], mz = m.elements[14];
			m.elements[12] = m.elements[13] = m.elements[14] = 0;

			// Multiply the orientation vector by the world matrix of the camera.
			var vec = new THREE.Vector3(0,0,1);
			vec.applyProjection(m);
			vec.normalize();

			// Multiply the up vector by the world matrix.
			var up = new THREE.Vector3(0,-1,0);
			up.applyProjection(m);
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
