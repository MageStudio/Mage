import { start } from '../base/App';

class Loader {

    constructor() {
        this.classname = 'game-loader';
    }

    start() {
        if (document) {
            this.element = document.createElement("div");
            this.element.className = this.className;
            document.body.appendChild(this.element);
            this.element.style.opacity = "1";
        }
    }

    stop() {
        this.element.style.opacity = "1";
        setTimeout(function() {
            document.body.removeChild(this.element);
        }, 250);
    }
}

class Router {

    constructor() {
        if (document && window) {
            this.loader = new Loader();

            window.addEventListener("message", this.onMessage, false);
            window.addEventListener("onmessage", this.onMessage, false);
        }
    }

    start(config) {
        if (config && typeof config === 'object') {
            this.config = config;
            this.init();
        } else {
            console.log('[Mage] You need provide a config to Router');
        }
    }

    init() {
        if (document && this.config.scenes.length > 0) {
            const firstScene = this.config.scenes[0];

            this.scenes = this.config.scenes;
            this.current = firstScene;

            return start(firstScene.className, firstScene.game, firstScene.assets);
        } else {
            console.log('[Mage] You need to provide at least one scene in your config');
        }
    }

    onMessage(message) {}

    checkScene(scene) {
        for (var i=0; i<this.scenes.length; i++) {
            if (this.scenes[i].name == scene) return true;
        }
        return false;
    }

    changeScene(scene) {
        if (!this.checkScene(scene)) {
            console.error('[Mage] Couldn\'t load scene: ' + scene);
            return;
        }
        this.loader.start();
        start(scene, this.config);
        this.current = scene;
        this.loader.stop();
    }
}

export default new Router();
