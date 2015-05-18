Class("Beat", {

	Beat : function(name) {
		this.name = name;
		//this sound name should already be loaded by our engine
		this.sound = {};
		this.sound.source = AudioEngine.context.createBufferSource();
		this.sound.volume = AudioEngine.context.createGain();
		this.sound.volume.gain.value = AudioEngine.VOLUME;

		//setting listeners
		this.setListeners();

		// Connect the sound source to the volume control.
		this.sound.source.connect(this.sound.volume);
		// Hook up the sound volume control to the main volume.
		this.sound.volume.connect(AudioEngine.volume);
	},

	setListeners : function() {
		//setting listeners
		this.sound.source._caller = this;
		//this.sound.source.onended = this.onEnd;
		//this.sound.source.loopEnd = this.onLoopEnd;
		//this.sound.source.loopStart = this.onLoopstart; 
	},

	reset : function() {
		this.sound.source.disconnect();
		this.sound.source = AudioEngine.context.createBufferSource();
		this.sound.source.connect(this.sound.volume);
		//setting listeners
		this.setListeners();
	},

	start : function() {
		var buffer = AudioEngine.get(this.name);
		if (!buffer) {
			console.error("Unable to load sound, sorry.");
			return;
		}
		this.sound.source.buffer = buffer;
		this.sound.volume.gain.value = 0;
		this.sound.source.start(AudioEngine.context.currentTime);
		var self = this;
		var _delay = function() {
			self.sound.volume.gain.value = self.sound.volume.gain.value + AudioEngine.DELAY_FACTOR;
			if (self.sound.volume.gain.value < AudioEngine.DELAY_NORMAL_VALUE) {
				setTimeout(_delay, AudioEngine.DELAY_STEP);
			}
		}
		_delay();
	},

	stop : function() {
		var self = this;
		var _delay = function() {
			self.sound.volume.gain.value = self.sound.volume.gain.value - AudioEngine.DELAY_FACTOR;
			if (self.sound.volume.gain.value > AudioEngine.DELAY_MIN_VALUE) {
				setTimeout(_delay, AudioEngine.DELAY_STEP);
			} else {
				self.sound.source.stop();
			}
		}
		_delay();
	},

	onEnd : function() {
		if (this._caller.onEndCallback) {
			this._caller.onEndCallback();
		}
		this._caller.reset();
	},

	onLoopEnd : function() {
		if (this._caller.onLoopEndCallback) {
			this._caller.onLoopEndCallback();
		}
	},

	onLoopStart : function() {
		if (this._caller.onLoopStartCallback) {
			this._caller.onLoopStartCallback();
		}
	}
	
});