import { AUDIO_UNABLE_TO_LOAD_SOUND } from '../lib/messages';
import Audio, { AUDIO_EVENTS } from './Audio';

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

    play(volume = this.getVolume()) {
        if (this.playing) return;

        this.setVolume(0);
        this.source.start();
        this.playing = true;
        this.volumeNode.gain.linearRampToValueAtTime(volume, Audio.context.currentTime + 0.1);
    }

    onSoundEnded() {
        this.reset();
    }

    stop() {
        this.volumeNode.gain.linearRampToValueAtTime(0, Audio.context.currentTime + 0.1);
        setTimeout(() => {
            this.source.stop();
        }, 100);
    }

    detune(value) {
        if (this.source) {
            this.source.detune.value = value;
        }
    }

}
