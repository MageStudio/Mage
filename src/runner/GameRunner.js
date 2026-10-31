import Level from "../core/Level";
import * as Store from "../store/Store";
import storage from "../storage/storage";
import { PATH_NOT_FOUND } from "../lib/messages";
import Physics, { PHYSICS_STATES } from "../physics";
import { Importer } from "../core/Importer";
import config from "../core/config";
import Audio from "../audio/Audio";
import Input from "../core/input/Input";
import Universe from "../core/universe";
import { pauseAllTweens, resumeAllTweens, clearAllTweens } from "../lib/easing";
import { requestLoadingScreen, removeLoadingScreen } from "../ui";

export class GameRunner {
    constructor() {
        this.store = {};
        this.running = null;
        this.levelReady = false;
        this.paused = false;
        this.audioSuspended = false;
        this.restartPromise = null;
    }

    has(path) {
        return Object.keys(this.store).includes(path);
    }

    get(path) {
        return this.store[path];
    }

    getCurrentLevel() {
        return this.running;
    }

    setCurrentLevel(level) {
        this.running = level;
    }

    getCurrentPath() {
        return this.currentPath;
    }

    setCurrentPath(path) {
        this.currentPath = path;
    }

    static isValidClassname(classname) {
        return typeof classname === "function";
    }

    register(path, classname) {
        try {
            if (GameRunner.isValidClassname(classname)) {
                this.store[path] = classname;
            } else {
                this.store[path] = Level;
            }
            return true;
        } catch {
            return false;
        }
    }

    createNewLevel = (path, options) => {
        const classname = this.get(path);
        const levelConfig = {
            ...options,
            path,
        };
        const level = new classname(levelConfig);

        Store.subscribe(level);

        return level;
    };

    assertReady(method) {
        if (!this.levelReady) {
            throw new Error(`GameRunner.${method}: no level is running`);
        }
    }

    isPaused() {
        return this.levelReady && this.paused;
    }

    resumeAudioIfSuspended() {
        if (this.audioSuspended) {
            this.audioSuspended = false;
            Audio.context.resume();
        }
    }

    pause(options = {}) {
        this.assertReady("pause");

        if (this.paused) {
            return;
        }

        const level = this.getCurrentLevel();

        this.paused = true;
        level.__setPaused(true);
        Physics.pause();
        pauseAllTweens();
        if (options.audio !== false && Audio.hasContext()) {
            Audio.context.suspend();
            this.audioSuspended = true;
        }
        Input.setPaused(true);

        if (typeof level.onPause === "function") {
            level.onPause();
        }
        Universe.onPause();
    }

    resume() {
        this.assertReady("resume");

        if (!this.paused) {
            return;
        }

        const level = this.getCurrentLevel();

        this.paused = false;
        level.__setPaused(false);
        Physics.resume();
        resumeAllTweens();
        this.resumeAudioIfSuspended();
        Input.setPaused(false);
        Input.dispatchMissedReleases();

        if (typeof level.onResume === "function") {
            level.onResume();
        }
        Universe.onResume();
    }

    togglePause(options = {}) {
        this.assertReady("togglePause");

        if (this.paused) {
            this.resume();
        } else {
            this.pause(options);
        }
    }

    restart() {
        if (this.restartPromise) {
            return this.restartPromise;
        }

        this.assertReady("restart");

        const settle = () => {
            this.restartPromise = null;
        };

        this.restartPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                const fail = error => {
                    removeLoadingScreen();
                    reject(error);
                };

                try {
                    requestLoadingScreen();
                    this.disposeCurrentLevel();
                    this.start(this.currentPath, this.currentOptions)
                        .then(level => {
                            removeLoadingScreen();
                            resolve(level);
                        })
                        .catch(fail);
                } catch (error) {
                    fail(error);
                }
            }, 0);
        });
        this.restartPromise.then(settle, settle);

        return this.restartPromise;
    }

    disposeCurrentLevel = () => {
        if (this.paused) {
            this.resumeAudioIfSuspended();
            Input.setPaused(false);
            this.paused = false;
        }
        clearAllTweens();
        this.levelReady = false;
        Store.unsubscribeAll();
        this.running.dispose();
        this.running = null;
    };

    start = (path, options = {}) => {
        return new Promise((resolve, reject) => {
            const { loading = false } = options;

            if (!this.has(path)) {
                reject(PATH_NOT_FOUND);
            }

            if (this.running) {
                this.disposeCurrentLevel();
            }

            this.setCurrentPath(path);
            this.currentOptions = options;
            this.setCurrentLevel(this.createNewLevel(path, options));

            if (loading) {
                this.getCurrentLevel().prepareScene();
                this.getCurrentLevel()
                    .init()
                    .then(() => {
                        storage
                            .load()
                            .then(Importer.parseLevelData)
                            .then(() => {
                                this.levelReady = true;
                                if (typeof this.getCurrentLevel().onStart === "function") {
                                    this.getCurrentLevel().onStart();
                                }
                                resolve(this.getCurrentLevel());
                            })
                            .catch(reject);
                    });
            } else {
                Physics.waitForState(PHYSICS_STATES.READY).then(() => {
                    this.getCurrentLevel().prepareScene();
                    this.getCurrentLevel()
                        .init()
                        .then(() => {
                            const levelData =
                                config.getLevelData(this.getCurrentLevel().getPath()) || {};

                            Importer.importLevelSnapshot(levelData)
                                .then(() => {
                                    this.levelReady = true;
                                    if (typeof this.getCurrentLevel().onStart === "function") {
                                        this.getCurrentLevel().onStart();
                                    }
                                    resolve(this.getCurrentLevel());
                                })
                                .catch(reject);
                        })
                        .catch(reject);
                });
            }
        });
    };
}

export default new GameRunner();
