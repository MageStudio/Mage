import BaseScene from '../base/BaseScene';
import { subscribeScene, unsubScribeScene } from '../store/Store';

import { PATH_NOT_FOUND } from '../lib/messages';

export default class GameRunner {

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

    createNewScene = (path, config, selector) => {
        const classname = this.get(path);
        const scene = new classname(config, selector);

        subscribeScene(path, scene);

        return scene;
    }

    disposeCurrentScene = (path) => {
        unsubScribeScene(path);
        this.running.dispose();
    }

    start(path, config, selector) {
        return new Promise((resolve, reject) => {
            if (!this.has(path)) {
                reject(PATH_NOT_FOUND);
            }

            if (this.running) {
                this.disposeCurrentScene();
            }

            this.running = this.createNewScene(path, config, selector);
            this.running.preload()
                .then(() => {
                    this.running.prepareScene();
                    this.running.load();
                    resolve(this.running);
                })
                .catch(reject);
        })
    }
}
