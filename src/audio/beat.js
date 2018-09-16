export default class Beat {

	constructor(name) {
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
	}

	setListeners() {
		//setting listeners
		this.sound.source._caller = this;
		//this.sound.source.onended = this.onEnd;
		//this.sound.source.loopEnd = this.onLoopEnd;
		//this.sound.source.loopStart = this.onLoopstart;
	}

	reset() {
		this.sound.source.disconnect();
		this.sound.source = M.audioEngine.context.createBufferSource();
		this.sound.source.connect(this.sound.volume);
		//setting listeners
		this.setListeners();
	}

	start() {
		const buffer = M.audioEngine.get(this.name);
		if (!buffer) {
			console.error("Unable to load sound, sorry.");
			return;
		}
		this.sound.source.buffer = buffer;
		this.sound.volume.gain.value = 0;
		this.sound.source.start(M.audioEngine.context.currentTime);

		const delay = () => {
			this.sound.volume.gain.value = this.sound.volume.gain.value + M.audioEngine.DELAY_FACTOR;
			if (this.sound.volume.gain.value < M.audioEngine.DELAY_NORMAL_VALUE) {
				setTimeout(delay, M.audioEngine.DELAY_STEP);
			}
		}
		delay();
	}

	stop() {
		const delay = () => {
			this.sound.volume.gain.value = this.sound.volume.gain.value - M.audioEngine.DELAY_FACTOR;
			if (this.sound.volume.gain.value > M.audioEngine.DELAY_MIN_VALUE) {
				setTimeout(delay, M.audioEngine.DELAY_STEP);
			} else {
				this.sound.source.stop();
			}
		}
		delay();
	}

	onEnd() {
		if (this._caller.onEndCallback) {
			this._caller.onEndCallback();
		}
		this._caller.reset();
	}

	onLoopEnd() {
		if (this._caller.onLoopEndCallback) {
			this._caller.onLoopEndCallback();
		}
	}

	onLoopStart() {
		if (this._caller.onLoopStartCallback) {
			this._caller.onLoopStartCallback();
		}
	}

}
