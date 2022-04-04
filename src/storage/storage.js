import GameRunner from '../runner/GameRunner';
import { getState } from '../store';

import { LOCALSTORAGE_NOT_AVAILABLE } from '../lib/messages';

const CURRENT_SCENE_NAME = 'CURRENT_SCENE_NAME';
const STATE_SNAPSHOT = 'STATE_SNAPSHOT';
const TIMESTAMP = 'TIMESTAMP';
const CURRENT_SCENE_JSON = 'CURRENT_SCENE_JSON';
const CURRENT_PATH = 'CURRENT_PATH';

export class Storage {

    static isLocalStorageAvailable() {
        return window &&
            window.localStorage &&
            typeof window.localStorage.setItem === 'function' &&
            typeof window.localStorage.getItem === 'function' &&
            typeof window.localStorage.removeItem === 'function' &&
            typeof window.localStorage.clear === 'function'
    }

    save() {
        if (Storage.isLocalStorageAvailable()) {
            try {
                const state = getState();
                const timestamp = +new Date();
                const currentScene = GameRunner.getCurrentLevel();
                const currentPath = GameRunner.getCurrentPath();

                const sceneJSON = currentScene.toJSON();
                const sceneName = currentScene.name;

                localStorage.setItem(TIMESTAMP, timestamp);
                localStorage.setItem(CURRENT_SCENE_NAME, sceneName);
                localStorage.setItem(STATE_SNAPSHOT, state);
                localStorage.setItem(CURRENT_PATH, currentPath);
                localStorage.setItem(CURRENT_SCENE_JSON, sceneJSON);

                return Promise.resolve({
                    sceneName,
                    currentPath,
                    timestamp
                });
            } catch(e) {
                return Promise.reject(e);
            }
        } else {
            return Promise.reject(LOCALSTORAGE_NOT_AVAILABLE);
        }
    }

    get(id) {
        if (Storage.isLocalStorageAvailable()) {
            return localStorage.getItem(id);
        } else {
            return null;
        }
    }

    loadCurrentPath() {
        if (Storage.isLocalStorageAvailable()) {
            const currentPath = localStorage.getItem(CURRENT_PATH);
            return Promise.resolve(currentPath);
        } else {
            return Promise.reject(LOCALSTORAGE_NOT_AVAILABLE);
        }
    }

    loadState() {
        if (Storage.isLocalStorageAvailable()) {
            const state = localStorage.getItem(STATE_SNAPSHOT);
            return Promise.resolve(JSON.parse(state));
        } else {
            return Promise.reject(LOCALSTORAGE_NOT_AVAILABLE);
        }
    }

    loadScene() {
        if (Storage.isLocalStorageAvailable()) {
            const scene = localStorage.getItem(CURRENT_SCENE_JSON);
            return Promise.resolve(JSON.parse(scene));
        } else {
            return Promise.reject(LOCALSTORAGE_NOT_AVAILABLE);
        }
    }
}



export default new Storage();
