(function() {

	window.M = window.M || {};

	M.audioEngine = {

		DELAY_FACTOR : 0.02,
		DELAY_STEP : 1, //millis
		DELAY_MIN_VALUE : 0.2,
		DELAY_NORMAL_VALUE : 40,
		VOLUME : 80,
		_volume : 80,

		soundPath : "js/core/sound/",
		soundModules : [
			"js/core/audio/beat", //parent
			"js/core/audio/sound",
			"js/core/audio/ambientSound"
		],

		numSound : 0,
		soundLoaded : 0,
		load : function() {

			M.audioEngine.map = new HashMap();
			M.audioEngine.sounds = [];

			M.audioEngine.AudioContext = window.AudioContext || window.webkitAudioContext || null;

			if (M.audioEngine.AudioContext) {
				//creating a new audio context if it's available.
				M.audioEngine.context = new M.audioEngine.AudioContext();
				//creating a gain node to control volume
				M.audioEngine.volume = M.audioEngine.context.createGain();
				M.audioEngine.volume.gain.value = M.audioEngine.VOLUME;
				//connecting volume node to context destination
				M.audioEngine.volume.connect(M.audioEngine.context.destination);
			} else {
				console.error("No Audio Context available, sorry.");
			}

			for (var audio in Assets.Audio) {
				M.audioEngine.numSound++;
				M.audioEngine.loadSingleFile(audio, Assets.Audio[audio]);
			}

			if (M.audioEngine.numSound == 0) {
				AssetsManager.completed.sound = true;
			}
		},

		get : function(id) {
			//returning stored buffer;
			return M.audioEngine.map.get(id) || false;
		},

		loadSingleFile : function(id, path) {
			// Load a sound file using an ArrayBuffer XMLHttpRequest.
			var request = new XMLHttpRequest();
			request.open("GET", path, true);
			request.responseType = "arraybuffer";
			request.onload = function(e) {

				// Create a buffer from the response ArrayBuffer.
				M.audioEngine.context.decodeAudioData(this.response, function onSuccess(buffer) {
					//storing audio buffer inside map
					M.audioEngine.map.put(id, buffer);
					M.audioEngine.soundLoaded++;
					M.audioEngine.checkLoad();
				}, function onFailure() {
					M.audioEngine.map.put(id, null);
					M.audioEngine.soundLoaded++;
					console.error("Decoding the audio buffer failed");
				});

			};
			request.send();
		},

		checkLoad: function() {
			if (M.audioEngine.soundLoaded == M.audioEngine.numSound) {
				AssetsManager.completed.sound = true;
			}
		},

		//add method
		add: function(sound) {
			M.audioEngine.sounds.push(sound);
		},

		update: function() {
			var start = new Date();
			for (var index in M.audioEngine.sounds) {
				var sound = M.audioEngine.sounds[index];
				sound.update(app.clock.getDelta());

				//now handling listener
				app.camera.object.updateMatrixWorld();
				var p = new THREE.Vector3();
				p.setFromMatrixPosition(app.camera.object.matrixWorld);

				//setting audio engine context listener position on camera position
				M.audioEngine.context.listener.setPosition(p.x, p.y, p.z);


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
				M.audioEngine.context.listener.setOrientation(vec.x, vec.y, vec.z, up.x, up.y, up.z);

				m.elements[12] = mx;
				m.elements[13] = my;
				m.elements[14] = mz;

				if ((+new Date() - start) > 50) return;
			}
		}
	};

	Object.defineProperty(AudioEngine, "VOLUME", {

		set: function(value) {
			M.audioEngine._volume = value;
			M.audioEngine.volume.gain.value = M.audioEngine._volume;
		},

		get: function() {
			if (M.audioEngine._volume) {
				return M.audioEngine._volume;
			}
		},
	});

})();
