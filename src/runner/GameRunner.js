import BaseScene from '../base/BaseScene';
import { subscribeScene, unsubScribeScene } from '../store/Store';
import storage from '../storage/storage';
import { PATH_NOT_FOUND } from '../lib/messages';

export class GameRunner {

    constructor() {
        this.store = {};
        this.running = null;
    }

    has(path) {
        return Object.keys(this.store).includes(path);
    }

    get(path) {
        return this.store[path];
    }

    getCurrentScene() {
        return this.running;
    }

    getCurrentPath() {
        return this.currentPath;
    }

    static isValidClassname(classname) {
        return typeof classname === 'function';
    }

    register(path, classname) {
        try {
            if (GameRunner.isValidClassname(classname)) {
                this.store[path] = classname;
            } else {
                this.store[path] = BaseScene;
            }
            return true;
        } catch(e) {
            return false;
        }
    }

    createNewScene = (path, options) => {
        const classname = this.get(path);
        const scene = new classname(options);

        subscribeScene(path, scene);

        return scene;
    }

    disposeCurrentScene = (path) => {
        unsubScribeScene(path);
        this.running.dispose();
    }

    start(path, config, selector, options) {
        return new Promise((resolve, reject) => {
            const { loading = false } = options;

            if (!this.has(path)) {
                reject(PATH_NOT_FOUND);
            }

            if (this.running) {
                this.disposeCurrentScene();
            }

            this.currentPath = path;
            this.running = this.createNewScene(path, options);
            if (loading) {
                storage
                    .loadScene()
                    .then(this.running.parseScene)
                    .then(() => {
                        this.running.prepareScene();
                        this.running.load();
                        resolve(this.running);
                    })
            } else {
                this.running.preload()
                    .then(() => {
                        this.running.prepareScene();
                        this.running.load();
                        resolve(this.running);
                    })
                    .catch(reject);
            }
        })
    }
}

export default new GameRunner();
