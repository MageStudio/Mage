import AudioEngine from './AudioEngine';

export default class Beat {

	constructor(name) {
		this.name = name;
		//this sound name should already be loaded by our engine
		this.sound = {};
		this.sound.source = AudioEngine.context.createBufferSource();
		this.sound.volume = AudioEngine.context.createGain();
		this.sound.volume.gain.value = AudioEngine.getVolume();

		this.buffer = null;

		//setting listeners
		this.setListeners();

		// Connect the sound source to the volume control.
		this.sound.source.connect(this.sound.volume);
		// Hook up the sound volume control to the main volume.
		this.sound.volume.connect(AudioEngine.volume);
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
		this.sound.source = AudioEngine.context.createBufferSource();
		this.sound.source.connect(this.sound.volume);
		//setting listeners
		this.setListeners();
	}

	setVolume(value) {
		this.sound.volume.gain.value = value;
	}

	hasBuffer() {
		return !!this.buffer;
	}

	setBuffer() {
		const buffer = AudioEngine.get(this.name);
		if (!buffer) {
			console.error("Unable to load sound, sorry.");
			return;
		}

		this.buffer = buffer;
		this.sound.source.buffer = buffer;
	}

	start() {

		if (!this.hasBuffer()) {
			this.setBuffer();
		}

		this.sound.volume.gain.value = 0;
		this.sound.source.start(AudioEngine.context.currentTime);

		const delay = () => {
			this.sound.volume.gain.value = this.sound.volume.gain.value + AudioEngine.DELAY_FACTOR;
			if (this.sound.volume.gain.value < AudioEngine.getVolume()) {
				setTimeout(delay, AudioEngine.DELAY_STEP);
			}
		}
		delay();
	}

	stop() {
		const delay = () => {
			this.sound.volume.gain.value = this.sound.volume.gain.value - AudioEngine.DELAY_FACTOR;
			if (this.sound.volume.gain.value > AudioEngine.DELAY_MIN_VALUE) {
				setTimeout(delay, AudioEngine.DELAY_STEP);
			} else {
				this.sound.source.stop();
			}
		}
		delay();
	}

	detune(value) {
		if (this.sound.source) {
			this.sound.source.detune.value = value;
		}
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
