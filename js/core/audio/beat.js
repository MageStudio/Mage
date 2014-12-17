Class("Beat", {

	Beat : function(name) {
		this.name = name;
		//this sound name should already be loaded by our engine
		this.sound = {};
		this.sound.source = AudioEngine.context.createBufferSource();
		this.sound.volume = AudioEngine.context.createGain();

		// Connect the sound source to the volume control.
		this.sound.source.connect(this.sound.volume);
		// Hook up the sound volume control to the main volume.
		this.sound.volume.connect(AudioEngine.volume);
	},

	start : function() {
		var buffer = AudioEngine.get(this.name);
		if (!buffer) {
			console.error("Unable to load sound, sorry.");
			return;
		}
		this.sound.source.buffer = AudioEngine.get(this.name);
		this.sound.source.start(AudioEngine.context.currentTime);
	},

	stop : function() {
		var self = this;
		var _delay = function() {
			self.gain.gain.value = self.gain.gain.value - AudioEngine.DELAY_FACTOR;
			if (self.gain.gain.value > AudioEngine.DELAY_MIN_VALUE) {
				setTimeout(_delay, AudioEngine.DELAY_STEP);
			} else {
				self.sound.stop();
				// i don't need to stop disconnect the sound.
			}
		}
		_delay();
	}
	
});