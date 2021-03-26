import { buildAssetId } from '../lib/utils/assets';
import { ROOT } from '../lib/constants';
import { ASSETS_AUDIO_LOAD_FAIL } from '../lib/messages';
import { evaluateCameraPosition } from '../lib/camera';
import RenderPipeline from '../render/RenderPipeline';

const TIME_FOR_UPDATE = 150;

export class Audio {

    constructor() {
        this.DELAY_FACTOR = 0.02;
        this.DELAY_STEP = 1; //millis
        this.DELAY_MIN_VALUE = 0.2;
        this.DELAY_NORMAL_VALUE = 40;
        this.VOLUME = 2;
        this._volume = 2;

        this.numSound = 0;
        this.soundLoaded = 0;

        this.sounds = [];
        this.map = {};

        this.currentLevel = ROOT;
    }

    setCurrentLevel = level => {
        this.currentLevel = level;
    }

    createAudioContext() {
        const AudioContext = window.AudioContext || window.webkitAudioContext || null;

        if (AudioContext) {
            //creating a new audio context if it's available.
            this.context = new AudioContext();
            //creating a gain node to control volume
            this.volume = this.context.createGain();
            this.volume.gain.value = this.getVolume();
            //connecting volume node to context destination
            this.volume.connect(this.context.destination);
        } else {
            console.error("No Audio Context available, sorry.");
        }
    }

    getVolume() {
        if (this._volume) {
            return this._volume;
        }
    }

    setVolume(value) {
        this._volume = value;
        this.volume.gain.value = this._volume;
    }

    load = (audio = {}, level) => {
        this.audio = audio;
        this.createAudioContext();

        if (Object.keys(this.audio).length === 0) {
            return Promise.resolve();
        }

        return Promise
            .all(Object
                .keys(this.audio)
                .map(id => this.loadSingleFile(id, level))
            )
            .catch(e => {
                console.log(ASSETS_AUDIO_LOAD_FAIL);
                console.log(e);

                return Promise.resolve();
            });
    }

    get(id) {
        return this.map[id] || this.map[buildAssetId(id, this.currentLevel)] || false;
    }

    loadSingleFile = (name, level) => {
        const path = this.audio[name];
        const request = new XMLHttpRequest();
        const id = buildAssetId(name, level);

        return new Promise(resolve => {
            request.open("GET", path, true);
            request.responseType = "arraybuffer";
            request.onreadystatechange = (e) => {
                if (request.readyState === 4 && request.status === 200) {
                    this.context.decodeAudioData(request.response,
                        buffer => {
                            this.map[id] = buffer;
                            resolve();
                        },
                        () => {
                            this.map[id] = null;
                            resolve();
                        });
                }
            };
            request.send();
        })
    }

    add(sound) {
        this.sounds.push(sound);
    }

    updateListener() {
        const { position, orientation, up } = evaluateCameraPosition(RenderPipeline.getCameraBody());
        this.context.listener.setPosition(position.x, position.y, position.z);
        this.context.listener.setOrientation(orientation.x, orientation.y, orientation.z, up.x, up.y, up.z);
    }

    update(dt) {
        this.updateListener();

        return new Promise(resolve => {
            const start = new Date();
            for (var index in this.sounds) {
                const sound = this.sounds[index];
                sound.update(dt);

                if ((+new Date() - start) > TIME_FOR_UPDATE) break;
            }

            resolve();
        });
    }
}

export default new Audio();
