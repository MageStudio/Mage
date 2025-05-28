import Level from "../core/Level";
import * as Store from "../store/Store";
import storage from "../storage/storage";
import { PATH_NOT_FOUND } from "../lib/messages";
import Physics, { PHYSICS_STATES } from "../physics";
import { Importer } from "../core/Importer";
import config from "../core/config";

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
        } catch (e) {
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

    disposeCurrentLevel = () => {
        Store.unsubscribeAll();
        this.running.dispose();
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
            this.setCurrentLevel(this.createNewLevel(path, options));

            if (loading) {
                this.getCurrentLevel().prepareScene();
                this.getCurrentLevel().init();
                storage
                    .load()
                    .then(Importer.parseLevelData)
                    .then(() => resolve(this.getCurrentLevel()));
            } else {
                Physics.waitForState(PHYSICS_STATES.READY).then(() => {
                    this.getCurrentLevel().prepareScene();
                    this.getCurrentLevel().init();

                    const levelURL = config.getLevelData(this.getCurrentLevel().getPath())?.url;

                    Importer.importLevelSnapshot(levelURL)
                        .then(() => resolve(this.getCurrentLevel()))
                        .catch(reject);
                });
            }
        });
    };
}

export default new GameRunner();
