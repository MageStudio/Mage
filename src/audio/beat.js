import Audio from './Audio';

export default class Beat {

    constructor(name) {
        this.name = name;
        //this sound name should already be loaded by our engine
        this.sound = {};
        this.sound.source = Audio.context.createBufferSource();
        this.sound.volume = Audio.context.createGain();
        this.sound.volume.gain.value = Audio.getVolume();

        this.buffer = null;

        // Connect the sound source to the volume control.
        this.sound.source.connect(this.sound.volume);
        // Hook up the sound volume control to the main volume.
        this.sound.volume.connect(Audio.volume);
    }

    // setListeners() {
    //     //setting listeners
    //     this.sound.source._caller = this;
    //     //this.sound.source.onended = this.onEnd;
    //     //this.sound.source.loopEnd = this.onLoopEnd;
    //     //this.sound.source.loopStart = this.onLoopstart;
    // }

    reset() {
        this.sound.source.disconnect();
        this.sound.source = Audio.context.createBufferSource();
        this.sound.source.connect(this.sound.volume);
        //setting listeners
        this.setListeners();
    }

    getVolume() {
        return this.sound.volume.gain;
    }

    setVolume(value) {
        this.sound.volume.gain.setValueAtTime(value, Audio.context.currentTime);
    }

    hasBuffer() {
        return !!this.buffer;
    }

    setBuffer() {
        const buffer = Audio.get(this.name);
        if (!buffer) {
            console.error("Unable to load sound, sorry.");
            return;
        }

        this.buffer = buffer;
        this.sound.source.buffer = buffer;
    }

    play(volume = Audio.getVolume()) {

        if (!this.hasBuffer()) {
            this.setBuffer();
        }

        this.setVolume(0);
        this.sound.source.start(Audio.context.currentTime);

        this.sound.volume.gain.linearRampToValueAtTime(volume, 0.5);
    }

    stop() {
        this.sound.volume.gain.linearRampToValueAtTime(0, 0.5);
        setTimeout(() => {
            this.sound.source.stop();
        }, 500);
    }

    detune(value) {
        if (this.sound.source) {
            this.sound.source.detune.value = value;
        }
    }

    // onEnd() {
    //     if (this._caller.onEndCallback) {
    //         this._caller.onEndCallback();
    //     }
    //     this._caller.reset();
    // }

    // onLoopEnd() {
    //     if (this._caller.onLoopEndCallback) {
    //         this._caller.onLoopEndCallback();
    //     }
    // }

    // onLoopStart() {
    //     if (this._caller.onLoopStartCallback) {
    //         this._caller.onLoopStartCallback();
    //     }
    // }

}
