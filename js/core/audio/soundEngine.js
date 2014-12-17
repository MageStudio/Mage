(function() {
	window.AudioEngine = {};

	AudioEngine.DELAY_FACTOR = 0.02;
	AudioEngine.DELAY_STEP = 5; //millis
	AudioEngine.DELAY_MIN_VALUE = 0.01;

	var soundPath = "js/core/sound/";
	var soundModules = [
		soundPath + "beat" //parent
		soundPath + "sound",
		soundPath + "ambientSound",
	];

	requirejs(soundModules, function() {

		AudioEngine.map = new Hashmap();
		AudioEngine.sounds = [];

		AudioEngine.AudioContext = window.AudioContext || window.webkitAudioContext || null;

		if (AudioEngine.AudioContext) {
			//creating a new audio context if it's available.
			AudioEngine.context = new AudioEngine.AudioContext();
			//creating a gain node to control volume
			AudioEngine.volume = AudioEngine.context.createGainNode();
			//connecting volume node to context destination
			AudioEngine.volume.connect(AudioEngine.context.destination);
		} else {
			console.error("No Audio Context available, sorry.");
		}
	});

	AudioEngine.numSound = 0;
	AudioEngine.soundLoaded = 0;
	AudioEngine.load = function() {
		for (var audio in Assets.Audio) {
			AudioEngine.numSound++;
			setTimeout(function() {
				AudioEngine.loadSingleFile(audio, Assets.Audio[audio]);
			}, 0);
		}
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
			AudioContext.context.decodeAudioData(this.response, function onSuccess(buffer) {
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
		for (var sound in AudioEngine.sounds) {
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
			
			if ((+new Date() - start) > 50) return;
		}
	}

})();