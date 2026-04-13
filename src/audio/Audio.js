import { Vector3 } from "three";
import Scene from "../core/Scene";
import env from "../env";
import { buildAssetId } from "../lib/utils/assets";
import { ROOT } from "../lib/constants";
import {
    ASSETS_AUDIO_FILE_LOAD_FAIL,
    ASSETS_AUDIO_LOAD_FAIL,
    AUDIO_CONTEXT_NOT_AVAILABLE,
} from "../lib/messages";

export const TIME_FOR_UPDATE = 5;
export const DELAY_FACTOR = 0.02;
export const DELAY_STEP = 1;
export const DELAY_MIN_VALUE = 0.2;
export const DELAY_NORMAL_VALUE = 40;
export const VOLUME = 2;
export const DEFAULT_AUDIO_NODE_VOLUME = 5;
export const DEFAULT_AUDIO_NODE_RAMP_TIME = 100; // value in ms

export const AUDIO_RAMPS = {
    LINEAR: "LINEAR",
    EXPONENTIAL: "EXPONENTIAL",
};

/**
 * Checks if a path is an absolute URL (with protocol).
 */
const isAbsoluteURL = path => {
    try {
        new URL(path);
        return true;
    } catch {
        return false;
    }
};

/**
 * Checks if a path is already a fully resolved URL.
 * The engine is agnostic about asset locations - it just needs to know
 * if the path is absolute (use as-is) or relative (prepend base URL).
 */
const isAlreadyResolved = path => {
    return path && isAbsoluteURL(path);
};

/**
 * Resolves an asset path to a full URL.
 * If path is already an absolute URL or contains the API path, returns it as-is.
 * If path is root-relative (starts with /), returns it as-is (served from public folder).
 * If path is relative and MAGE_ASSETS_BASE_URL is set, prepends the base URL.
 * @param {string} path - The asset path (relative or absolute)
 * @returns {string} - The resolved full URL
 */
const resolveAssetPath = path => {
    // If already a full URL or already contains the API path, return as-is
    if (isAlreadyResolved(path)) {
        return path;
    }

    // Root-relative paths (starting with /) are served from the public folder
    // and should not be modified with base URL
    if (path && path.startsWith("/")) {
        return path;
    }

    // If MAGE_ASSETS_BASE_URL is set, prepend it to the relative path
    const baseUrl = env.MAGE_ASSETS_BASE_URL;
    if (baseUrl) {
        return `${baseUrl}/${path}`;
    }

    // Warn if path contains colon (could be mistaken for protocol) and no base URL is set
    if (path && path.includes(":") && !path.startsWith("/")) {
        console.warn(
            `[Mage] Asset path "${path}" contains a colon but MAGE_ASSETS_BASE_URL is not set. ` +
                `This may cause the browser to interpret it as a protocol scheme. ` +
                `Prepending "./" to make it a relative path.`,
        );
        return `./${path}`;
    }

    // Fallback: return the path as-is (for backwards compatibility)
    return path;
};

export class Audio {
    constructor() {
        this.masterVolumeNode = null;
        this.context = null;

        this.levelSounds = [];
        this.buffersMap = {};
        this.audioAssets = {};

        this.currentLevel = ROOT;
    }

    reset() {
        this.levelSounds = [];
    }

    setCurrentLevel = level => {
        this.currentLevel = level;
    };

    hasContext() {
        return !!this.context;
    }

    hasSounds() {
        return this.levelSounds.length > 0;
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
        console.log(AUDIO_CONTEXT_NOT_AVAILABLE);
    }

    getVolume() {
        if (this.masterVolumeNode) {
            return this.masterVolumeNode.gain.value;
        }
        console.log(AUDIO_CONTEXT_NOT_AVAILABLE);
    }

    getMasterVolumeNode() {
        return this.masterVolumeNode;
    }

    setVolume(value) {
        this.masterVolumeNode.gain.setValueAtTime(value, this.context.currentTime);
    }

    load = (audioAssets = {}, level) => {
        this.audioAssets = audioAssets;
        this.createAudioContext();

        if (Object.keys(this.audioAssets).length === 0) {
            return Promise.resolve();
        }

        return Promise.all(
            Object.keys(this.audioAssets).map(id => this.loadAssetByName(id, level)),
        ).catch(e => {
            console.error(ASSETS_AUDIO_LOAD_FAIL);
            console.log(e);

            return Promise.resolve();
        });
    };

    get(id) {
        return this.buffersMap[id] || this.buffersMap[buildAssetId(id, this.currentLevel)] || false;
    }

    loadAssetByName = (name, level) => {
        const path = this.audioAssets[name];
        const id = buildAssetId(name, level);

        return this.loadAssetByPath(path, id);
    };

    loadAssetByPath = (path, id) => {
        // Resolve the path using MAGE_ASSETS_BASE_URL if available
        const resolvedPath = resolveAssetPath(path);
        const request = new XMLHttpRequest();
        return new Promise(resolve => {
            request.open("GET", resolvedPath, true);
            request.responseType = "arraybuffer";
            request.onreadystatechange = _e => {
                if (request.readyState === 4) {
                    if (request.status === 200) {
                        this.context.decodeAudioData(
                            request.response,
                            buffer => {
                                this.buffersMap[id] = buffer;
                                resolve();
                            },
                            () => {
                                this.buffersMap[id] = null;
                                console.error(ASSETS_AUDIO_FILE_LOAD_FAIL);
                                resolve();
                            },
                        );
                    } else {
                        // Handle HTTP errors (404, etc.) - log warning and continue
                        console.warn(
                            `[Mage] Failed to load audio "${id}" from ${resolvedPath}: HTTP ${request.status}`,
                        );
                        this.buffersMap[id] = null;
                        resolve();
                    }
                }
            };
            request.send();
        });
    };

    add(sound) {
        this.levelSounds.push(sound);
    }

    updateListenerPosition() {
        Scene.getCameraBody().updateMatrixWorld();
        const p = new Vector3();
        p.setFromMatrixPosition(Scene.getCameraBody().matrixWorld);

        this.context.listener.positionX.setValueAtTime(p.x, this.context.currentTime);
        this.context.listener.positionY.setValueAtTime(p.y, this.context.currentTime);
        this.context.listener.positionZ.setValueAtTime(p.z, this.context.currentTime);
    }

    updatelistenerOrientation() {
        const m = Scene.getCameraBody().matrix;
        const mx = m.elements[12],
            my = m.elements[13],
            mz = m.elements[14];
        m.elements[12] = m.elements[13] = m.elements[14] = 0;

        const vec = new Vector3(0, 0, 1);
        vec.applyMatrix4(m);
        vec.normalize();

        const up = new Vector3(0, -1, 0);
        up.applyMatrix4(m);
        up.normalize();

        this.context.listener.forwardX.setValueAtTime(vec.x, this.context.currentTime);
        this.context.listener.forwardY.setValueAtTime(vec.y, this.context.currentTime);
        this.context.listener.forwardZ.setValueAtTime(vec.z, this.context.currentTime);
        this.context.listener.upX.setValueAtTime(up.x, this.context.currentTime);
        this.context.listener.upY.setValueAtTime(up.y, this.context.currentTime);
        this.context.listener.upZ.setValueAtTime(up.z, this.context.currentTime);

        m.elements[12] = mx;
        m.elements[13] = my;
        m.elements[14] = mz;
    }

    dispose() {
        for (let index in this.levelSounds) {
            const sound = this.levelSounds[index];
            sound.dispose();
        }

        this.reset();
    }

    update(dt) {
        if (!this.hasContext()) return;

        if (this.hasSounds()) {
            this.updateListenerPosition();
            this.updatelistenerOrientation();
        }

        const start = new Date();
        for (let index in this.levelSounds) {
            const sound = this.levelSounds[index];
            sound.update(dt);

            if (+new Date() - start > TIME_FOR_UPDATE) break;
        }
    }

    toJSON(parseJSON = false) {
        return {
            sounds: this.levelSounds.map(sound => sound.toJSON(parseJSON)),
        };
    }
}

export default new Audio();
