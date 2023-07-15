import { Object3D } from "three";
import { ENTITY_EVENTS, ENTITY_TYPES } from "../entities/constants";
import Entity from "../entities/Entity";
import { ALMOST_ZERO, TAGS } from "../lib/constants";
import { AUDIO_SOURCE_NOT_DEFINED, AUDIO_UNABLE_TO_LOAD_SOUND } from "../lib/messages";
import { generateRandomName } from "../lib/uuid";
import Audio, {
    AUDIO_RAMPS,
    DEFAULT_AUDIO_NODE_RAMP_TIME,
    DEFAULT_AUDIO_NODE_VOLUME,
} from "./Audio";
import HelperSprite from "../entities/base/HelperSprite";

const DEFAULT_SETUP_CONFIG = {
    deferred: false,
};

export default class Sound extends Entity {
    constructor(options = {}) {
        const {
            source,
            loop = false,
            loopStart,
            loopEnd,
            autoplay,
            reconnectOnReset,
            setupConfig = DEFAULT_SETUP_CONFIG,
            name = generateRandomName("sound"),
        } = options;

        super({
            ...options,
            source,
            loop,
            loopStart,
            loopEnd,
            autoplay,
            reconnectOnReset,
            name,
        });

        this.setupConfig = setupConfig;

        this.source = source;
        this.loop = loop;
        this.loopStart = loopStart;
        this.loopEnd = loopEnd;
        this.autoplay = autoplay;
        this.reconnectOnReset = reconnectOnReset;
        this.name = name;

        this.connected = false;
        this.playing = false;
        this.setupCompleted = false;
        this.hasPlayed = false;

        this.buffer = null;
        this.audioNode = null;
        this.volumeNode = null;

        if (!this.setupConfig.deferred) {
            this.setupAudio();
        }
        this.setName(name);
        this.setBody({ body: new Object3D() });
        this.setEntityType(ENTITY_TYPES.AUDIO.DEFAULT);

        Audio.add(this);

        if (this.isSetupCompleted()) {
            this.connect();
        }
    }

    addHelpers({ holderName = "soundholder", holderSize = 0.05 } = {}) {
        const holderSprite = new HelperSprite(holderSize, holderSize, holderName, {
            name: holderName,
        });

        if (holderSprite) {
            holderSprite.setSizeAttenuation(false);
            holderSprite.setDepthTest(false);
            holderSprite.setDepthWrite(false);
            holderSprite.setSerializable(false);
            holderSprite.setPosition(this.getPosition());
            holderSprite.addTags([TAGS.LIGHTS.HELPER, TAGS.LIGHTS.HOLDER, name]);

            holderSprite.setHelperTarget(this);

            this.holder = holderSprite;

            return true;
        } else {
            console.warn(LIGHT_HOLDER_MODEL_NOT_FOUND);
            return false;
        }
    }

    isPlaying() {
        return this.playing;
    }

    isSetupCompleted() {
        return this.setupCompleted;
    }

    isConnected() {
        return this.connected;
    }

    setupAudio() {
        this.createAudioNode();
        this.createVolumeNode();
        this.setBuffer();
        this.setupAudioNodeLoop();

        this.audioNode.removeEventListener(ENTITY_EVENTS.AUDIO.ENDED, this.onSoundEnded.bind(this));
        this.audioNode.addEventListener(ENTITY_EVENTS.AUDIO.ENDED, this.onSoundEnded.bind(this));

        this.setupCompleted = true;
    }

    setSource(source) {
        this.source = source;
    }

    getSource() {
        return this.source;
    }

    get sampleRate() {
        return this.buffer.sampleRate;
    }

    get duration() {
        return this.buffer.duration * 1000;
    }

    get numberOfChannels() {
        return this.buffer.numberOfChannels;
    }

    createAudioNode() {
        this.audioNode = Audio.context.createBufferSource();
    }

    setupAudioNodeLoop() {
        this.audioNode.loop = this.loop;
        this.audioNode.loopEnd = this.loopEnd === undefined ? this.duration : this.loopEnd;
        this.audioNode.loopStart = this.loopStart === undefined ? this.duration : this.loopStart;
    }

    createVolumeNode() {
        this.volumeNode = Audio.context.createGain();
        this.volumeNode.gain.value = DEFAULT_AUDIO_NODE_VOLUME;
    }

    tryAutoplay() {
        if (this.autoplay && !this.hasPlayed && !this.setupConfig.deferred) {
            this.play();
        }
    }

    connect() {
        if (this.isConnected()) {
            this.disconnect();
        }

        this.volumeNode.connect(Audio.getMasterVolumeNode());
        this.audioNode.connect(this.volumeNode);
        this.connected = true;

        this.tryAutoplay();
    }

    disconnect() {
        if (this.isConnected()) {
            this.volumeNode.disconnect();
            this.audioNode.disconnect();
            this.connected = false;
        }
    }

    reset = () => {
        this.playing = false;

        this.disconnect();

        this.setupAudio();
        this.connect();
    };

    dispose() {
        super.dispose();
        this.stop();
        this.disconnect();
    }

    getVolume() {
        return this.volumeNode ? this.volumeNode.gain.value : Audio.getVolume();
    }

    setVolume(value = DEFAULT_AUDIO_NODE_VOLUME) {
        this.volumeNode.gain.setValueAtTime(value, Audio.context.currentTime);
    }

    hasBuffer() {
        return !!this.buffer;
    }

    setBuffer() {
        if (!this.getSource()) {
            console.error(AUDIO_SOURCE_NOT_DEFINED);
            return false;
        }

        const buffer = Audio.get(this.source);

        if (!buffer) {
            console.error(AUDIO_UNABLE_TO_LOAD_SOUND);
            return false;
        }

        this.buffer = buffer;
        this.audioNode.buffer = buffer;

        return true;
    }

    play(
        volume = this.getVolume(),
        delay = DEFAULT_AUDIO_NODE_RAMP_TIME,
        ramp = AUDIO_RAMPS.LINEAR,
    ) {
        if (this.isPlaying()) return this;
        if (!this.isSetupCompleted()) this.setupAudio();
        if (!this.isConnected()) this.connect();

        console.log("goin to start playing at volume", volume, this.source);
        this.setVolume(0);
        this.audioNode.start();

        this.hasPlayed = true;
        this.playing = true;

        const audioDelay = delay / 1000; // linearRampToValueAtTime/exponentialRampToValueAtTime requires time to be expressed in seconds

        if (ramp === AUDIO_RAMPS.LINEAR) {
            this.volumeNode.gain.linearRampToValueAtTime(
                volume,
                Audio.context.currentTime + audioDelay,
            );
        } else {
            this.volumeNode.gain.exponentialRampToValueAtTime(
                volume,
                Audio.context.currentTime + audioDelay,
            );
        }

        return this;
    }

    onSoundEnded() {
        this.reset();
        this.dispatchEvent({ type: ENTITY_EVENTS.AUDIO.ENDED });
    }

    stop(delay = DEFAULT_AUDIO_NODE_RAMP_TIME, ramp = AUDIO_RAMPS.LINEAR) {
        const audioDelay = delay / 1000; // linearRampToValueAtTime/exponentialRampToValueAtTime requires time to be expressed in seconds

        if (ramp === AUDIO_RAMPS.LINEAR) {
            this.volumeNode.gain.linearRampToValueAtTime(
                ALMOST_ZERO,
                Audio.context.currentTime + audioDelay,
            );
        } else {
            this.volumeNode.gain.exponentialRampToValueAtTime(
                ALMOST_ZERO,
                Audio.context.currentTime + audioDelay,
            );
        }

        setTimeout(this.reset, delay);

        return this;
    }

    detune(value) {
        if (this.audioNode) {
            this.detune = value;
            this.audioNode.detune.value = this.detune;
        }
    }

    getDetune() {
        return this.detune;
    }

    addEffect(effect) {
        if (!this.hasEffect() && effect) {
            this.convolverNode = Audio.context.createConvolver();
            this.mixerNode = Audio.createGain();

            if (this.hasPannerNode()) {
                this.pannerNode.disconnect();
                this.pannerNode.connect(this.mixerNode);
            } else {
                this.volumeNode.disconnect();
                this.volumeNode.connect(this.mixerNode);
            }

            //creating gains
            this.plainGainNode = Audio.context.createGain();
            this.convolverGainNode = Audio.context.createGain();

            //connect mixer to new gains
            this.mixerNode.connect(this.plainGainNode);
            this.mixerNode.connect(this.convolverGainNode);

            this.plainGainNode.connect(Audio.getMasterVolumeNode());
            this.convolverGainNode.connect(Audio.getMasterVolumeNode());

            this.convolverNode.buffer = Audio.get(effect);

            this.convolverGainNode.gain.setValueAtTime(0.7, Audio.context.currentTime);
            this.plainGainNode.gain.setValueAtTime(0.3, Audio.context.currentTime);
        }
    }

    setPosition(where, { updateHolder = true } = {}) {
        const position = {
            ...this.getPosition(),
            ...where,
        };

        const { x, y, z } = position;

        if (this.hasBody()) {
            this.body.position.set(x, y, z);
        }

        if (this.hasHolder() && updateHolder) {
            this.holder.setPosition({ x, y, z });
        }
    }

    toJSON() {
        return {
            ...super.toJSON(),
            source: this.source,
            loop: this.loop,
            loopStart: this.loopStart,
            loopEnd: this.loopEnd,
            autoplay: this.autoplay,
            volume: this.getVolume(),
            detune: this.getDetune(),
            hasPlayed: this.hasPlayed,
            playing: this.isPlaying(),
            connected: this.isConnected(),
            duration: this.duration,
            sampleRate: this.sampleRate,
            numberOfChannels: this.numberOfChannels,
        };
    }
}
