(function() {
	window.AudioEngine = {};

	AudioEngine.DELAY_FACTOR = 0.02;
	AudioEngine.DELAY_STEP = 1; //millis
	AudioEngine.DELAY_MIN_VALUE = 0.2;
	AudioEngine.DELAY_NORMAL_VALUE = 40;

	var soundPath = "js/core/sound/";
	AudioEngine.soundModules = [
		"js/core/audio/beat", //parent
		"js/core/audio/sound",
		"js/core/audio/ambientSound"
	];

	AudioEngine.numSound = 0;
	AudioEngine.soundLoaded = 0;
	AudioEngine.load = function() {

		requirejs(AudioEngine.soundModules, function() {

			AudioEngine.map = new HashMap();
			AudioEngine.sounds = [];

			AudioEngine.AudioContext = window.AudioContext || window.webkitAudioContext || null;

			if (AudioEngine.AudioContext) {
				//creating a new audio context if it's available.
				AudioEngine.context = new AudioEngine.AudioContext();
				//creating a gain node to control volume
				AudioEngine.volume = AudioEngine.context.createGain();
				AudioEngine.volume.gain.value = 50;
				//connecting volume node to context destination
				AudioEngine.volume.connect(AudioEngine.context.destination);
			} else {
				console.error("No Audio Context available, sorry.");
			}

			for (var audio in Assets.Audio) {
				AudioEngine.numSound++;
				AudioEngine.loadSingleFile(audio, Assets.Audio[audio]);
			}

		});
	};

	AudioEngine.get = function(id) {
		//returning stored buffer;
		return AudioEngine.map.get(id) || false;
	}

	AudioEngine.loadSingleFile = function(id, path) {
		// Load a sound file using an ArrayBuffer XMLHttpRequest.
		var request = new XMLHttpRequest();
		request.open("GET", path, true);
		request.responseType = "arraybuffer";
		request.onload = function(e) {

			// Create a buffer from the response ArrayBuffer.
			AudioEngine.context.decodeAudioData(this.response, function onSuccess(buffer) {
				//storing audio buffer inside map
				AudioEngine.map.put(id, buffer);
				AudioEngine.soundLoaded++;
				AudioEngine.checkLoad();
			}, function onFailure() {
				AudioEngine.map.put(id, null);
				AudioEngine.soundLoaded++;
				console.error("Decoding the audio buffer failed");
			});

		};
		request.send();
	};

	AudioEngine.checkLoad = function() {
		if (AudioEngine.soundLoaded == AudioEngine.numSound) {
			AssetsManager.completed.sound = true;
		}
	},

	//add method
	AudioEngine.add = function(sound) {
		AudioEngine.sounds.push(sound);
	},

	AudioEngine.update = function() {
		var start = new Date();
		for (var index in AudioEngine.sounds) {
			var sound = AudioEngine.sounds[index];
			with(sound) {
				setTimeout(function() {
					update(core.clock.getDelta());
				}, 0);
			}
			//now handling listener
			core.camera.object.updateMatrixWorld();
			var p = new THREE.Vector3();
			p.setFromMatrixPosition(core.camera.object.matrixWorld);

			//setting audio engine context listener position on camera position
			AudioEngine.context.listener.setPosition(p.x, p.y, p.z);


			//this is to add up and down vector to our camera
			// The camera's world matrix is named "matrix".
			var m = core.camera.object.matrix;

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
			AudioEngine.context.listener.setOrientation(vec.x, vec.y, vec.z, up.x, up.y, up.z);

			m.elements[12] = mx;
			m.elements[13] = my;
			m.elements[14] = mz;
			
			if ((+new Date() - start) > 50) return;
		}
	}

})();