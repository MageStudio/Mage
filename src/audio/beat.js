import { AUDIO_UNABLE_TO_LOAD_SOUND } from '../lib/messages';
import Audio, { AUDIO_EVENTS, AUDIO_RAMPS } from './Audio';

export default class Beat {

    constructor(name, options = {}) {
        this.name = name;
        this.buffer = null;
        this.connected = false;
        this.playing = false;

        this.options = options;

        this.init();
        this.connect();
    }

    init() {
        this.source = Audio.context.createBufferSource();
        this.createVolumeNode();
        this.setBuffer();

        this.source.addEventListener(AUDIO_EVENTS.ENDED, this.onSoundEnded.bind(this));
    }

    createVolumeNode() {
        this.volumeNode = Audio.context.createGain();
        this.volumeNode.gain.value = 20;
    }

    connect() {
        if (this.connected) {
            this.disconnect();
        }

        this.volumeNode.connect(Audio.getMasterVolumeNode());
        this.source.connect(this.volumeNode);
        this.connected = true;
    }

    disconnect() {
        if (this.connected) {
            this.volumeNode.disconnect();
            this.source.disconnect();
            this.connected = false;
        }
    }

    reset() {
        this.playing = false;
        const { reconnectOnReset } = this.options;

        this.disconnect();

        if (reconnectOnReset) {
            this.init();
            this.connect();
        }
    }

    dispose() {
        this.stop();
        this.disconnect();
    }

    getVolume() {
        return this.volumeNode.gain.value;
    }

    setVolume(value) {
        this.volumeNode.gain.setValueAtTime(value, Audio.context.currentTime);
    }

    hasBuffer() {
        return !!this.buffer;
    }

    setBuffer() {
        const buffer = Audio.get(this.name);

        if (!buffer) {
            console.error(AUDIO_UNABLE_TO_LOAD_SOUND);
            return;
        }

        this.buffer = buffer;
        this.source.buffer = buffer;
    }

    play(volume = this.getVolume(), delay = 0.1, ramp = AUDIO_RAMPS.LINEAR) {
        if (this.playing) return;

        this.setVolume(0);
        this.source.start();
        this.playing = true;

        if (ramp === AUDIO_RAMPS.LINEAR) {
            this.volumeNode.gain.linearRampToValueAtTime(volume, Audio.context.currentTime + delay);
        } else {
            this.volumeNode.gain.exponentialRampToValueAtTime(volume, Audio.context.currentTime + delay);
        }
    }

    onSoundEnded() {
        this.reset();
    }

    stop(delay = 0.1, ramp = AUDIO_RAMPS.LINEAR) {
        if (ramp === AUDIO_RAMPS.LINEAR) {
            this.volumeNode.gain.linearRampToValueAtTime(0, Audio.context.currentTime + delay);
        }  else {
            this.volumeNode.gain.exponentialRampToValueAtTime(0, Audio.context.currentTime + delay);
        }

        setTimeout(() => {
            this.source.stop();
        }, delay);
    }

    detune(value) {
        if (this.source) {
            this.source.detune.value = value;
        }
    }

}
