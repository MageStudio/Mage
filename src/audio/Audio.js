import {
    Vector3
} from 'three';
import Scene from '../core/Scene';
import { buildAssetId } from '../lib/utils/assets';
import { ROOT } from '../lib/constants';
import { ASSETS_AUDIO_LOAD_FAIL, AUDIO_CONTEXT_NOT_AVAILABLE } from '../lib/messages';

const TIME_FOR_UPDATE = 150;
const DELAY_FACTOR = 0.02;
const DELAY_STEP = 1;
const DELAY_MIN_VALUE = 0.2;
const DELAY_NORMAL_VALUE = 40;
const VOLUME = 2;

export const AUDIO_EVENTS = {
    ENDED: 'ended'
};

export class Audio {

    constructor() {
        this.masterVolumeNode = null;
        this.context = null;

        this.numSound = 0;
        this.soundLoaded = 0;

        this.sounds = [];
        this.map = {};

        this.currentLevel = ROOT;
    }

    setCurrentLevel = level => {
        this.currentLevel = level;
    }

    hasContext() {
        return !!this.context;
    }

    createAudioContext() {
        const AudioContext = window.AudioContext || window.webkitAudioContext || null;

        if (!this.hasContext()) {
            if (AudioContext) {
                this.context = new AudioContext();
                this.createMasterVolumeNode();
            } else {
                console.error(AUDIO_CONTEXT_NOT_AVAILABLE);
            }
        }
    }

    createMasterVolumeNode() {
        this.masterVolumeNode = this.context.createGain();
        this.setVolume(VOLUME);

        this.masterVolumeNode.connect(this.getDestination());
    }

    getDestination() {
        if (this.context) {
            return this.context.destination;
        }
    }

    getVolume() {
        if (this.masterVolumeNode) {
            return this.masterVolumeNode.gain.value;
        }
    }

    getMasterVolumeNode() {
        return this.masterVolumeNode;
    }

    setVolume(value) {
        this.masterVolumeNode.gain.setValueAtTime(value, this.context.currentTime);
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

    updateListenerPosition() {
        //now handling listener
        Scene.getCameraBody().updateMatrixWorld();
        const p = new Vector3();
        p.setFromMatrixPosition(Scene.getCameraBody().matrixWorld);

        //setting audio engine context listener position on camera position
        this.context.listener.setPosition(p.x, p.y, p.z);
    }

    updatelistenerOrientation() {
        //this is to add up and down vector to our camera
        // The camera's world matrix is named "matrix".
        const m = Scene.getCameraBody().matrix;

        const mx = m.elements[12], my = m.elements[13], mz = m.elements[14];
        m.elements[12] = m.elements[13] = m.elements[14] = 0;

        // Multiply the orientation vector by the world matrix of the camera.
        const vec = new Vector3(0,0,1);
        vec.applyMatrix4(m);
        vec.normalize();

        // Multiply the up vector by the world matrix.
        const up = new Vector3(0,-1,0);
        up.applyMatrix4(m);
        up.normalize();

        // Set the orientation and the up-vector for the listener.
        this.context.listener.setOrientation(vec.x, vec.y, vec.z, up.x, up.y, up.z);

        m.elements[12] = mx;
        m.elements[13] = my;
        m.elements[14] = mz;
    }

    update(dt) {
        if (!this.hasContext()) return;

        const start = new Date();
        for (var index in this.sounds) {
            const sound = this.sounds[index];
            sound.update(dt);

            this.updateListenerPosition();
            this.updatelistenerOrientation();

            if ((+new Date() - start) > TIME_FOR_UPDATE) break;
        }
    }
}

export default new Audio();
