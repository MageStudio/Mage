import GameRunner from "../runner/GameRunner";
import { getState } from "../store";

import { LOCALSTORAGE_NOT_AVAILABLE } from "../lib/messages";

const CURRENT_LEVEL_NAME = "CURRENT_LEVEL_NAME";
const STATE_SNAPSHOT = "STATE_SNAPSHOT";
const TIMESTAMP = "TIMESTAMP";
const CURRENT_LEVEL_JSON = "CURRENT_LEVEL_JSON";
const CURRENT_PATH = "CURRENT_PATH";

export class Storage {
    static isLocalStorageAvailable() {
        return (
            window &&
            window.localStorage &&
            typeof window.localStorage.setItem === "function" &&
            typeof window.localStorage.getItem === "function" &&
            typeof window.localStorage.removeItem === "function" &&
            typeof window.localStorage.clear === "function"
        );
    }

    save(options = {}) {
        if (Storage.isLocalStorageAvailable()) {
            try {
                const state = getState();
                const timestamp = +new Date();
                const currentLevel = GameRunner.getCurrentLevel();
                const currentPath = GameRunner.getCurrentPath();
                const { parseJSON = false } = options;

                const levelJSON = currentLevel.toJSON(parseJSON);
                const levelName = currentLevel.getName();

                localStorage.setItem(TIMESTAMP, timestamp);
                localStorage.setItem(CURRENT_LEVEL_NAME, levelName);
                localStorage.setItem(STATE_SNAPSHOT, state);
                localStorage.setItem(CURRENT_PATH, currentPath);
                localStorage.setItem(CURRENT_LEVEL_JSON, levelJSON);

                return Promise.resolve({
                    levelName,
                    currentPath,
                    timestamp,
                });
            } catch (e) {
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

    load() {
        if (Storage.isLocalStorageAvailable()) {
            const level = localStorage.getItem(CURRENT_LEVEL_JSON);
            return Promise.resolve(JSON.parse(level));
        } else {
            return Promise.reject(LOCALSTORAGE_NOT_AVAILABLE);
        }
    }
}

export default new Storage();
