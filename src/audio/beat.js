Class("Beat", {

	Beat : function(name) {
		this.name = name;
		//this sound name should already be loaded by our engine
		this.sound = {};
		this.sound.source = M.audioEngine.context.createBufferSource();
		this.sound.volume = M.audioEngine.context.createGain();
		this.sound.volume.gain.value = M.audioEngine.VOLUME;

		//setting listeners
		this.setListeners();

		// Connect the sound source to the volume control.
		this.sound.source.connect(this.sound.volume);
		// Hook up the sound volume control to the main volume.
		this.sound.volume.connect(M.audioEngine.volume);
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
		this.sound.source = M.audioEngine.context.createBufferSource();
		this.sound.source.connect(this.sound.volume);
		//setting listeners
		this.setListeners();
	},

	start : function() {
		var buffer = M.audioEngine.get(this.name);
		if (!buffer) {
			console.error("Unable to load sound, sorry.");
			return;
		}
		this.sound.source.buffer = buffer;
		this.sound.volume.gain.value = 0;
		this.sound.source.start(M.audioEngine.context.currentTime);
		var self = this;
		var _delay = function() {
			self.sound.volume.gain.value = self.sound.volume.gain.value + M.audioEngine.DELAY_FACTOR;
			if (self.sound.volume.gain.value < M.audioEngine.DELAY_NORMAL_VALUE) {
				setTimeout(_delay, M.audioEngine.DELAY_STEP);
			}
		}
		_delay();
	},

	stop : function() {
		var self = this;
		var _delay = function() {
			self.sound.volume.gain.value = self.sound.volume.gain.value - M.audioEngine.DELAY_FACTOR;
			if (self.sound.volume.gain.value > M.audioEngine.DELAY_MIN_VALUE) {
				setTimeout(_delay, M.audioEngine.DELAY_STEP);
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