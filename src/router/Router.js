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

export default class Router {

    constructor(data) {
        if (document && window) {
            this.iframe = document.createElement('iframe');
            this.baseFolder = 'scenes/';

            this.loader = new Loader();

            window.addEventListener("message", this.onMessage, false);
            window.addEventListener("onmessage", this.onMessage, false);
            window.addEventListener('load', this.onLoad, false);
        }
    }

    onGameJSONLoad = (request) => () => {
        try {
            const data = JSON.parse(request.responseText);

            this.init({
                ...data
            });
        } catch(e) {
            console.log('[Mage] Couldn\'t load game.json');
        }
    }

    onLoad() {
        const request = new XMLHttpRequest();
        request.addEventListener("load", this.onGameJSONLoad(request));
        request.open("GET", "game.json");
        request.send();
    }

    start(data) {
        if (document) {
            this.iframe.src = this.baseFolder + "" + (data.firstScene ? data.firstScene : data.scenes[0].name);

            this.firstScene = data.firstScene;
            this.scenes = data.scenes;
            this.current = data.firstScene;

            document.body.appendChild(this.iframe);
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
        if (!this.iframe || !this.checkScene(scene)) {
            console.error('[Mage] Couldn\'t load scene: ' + scene);
            return;
        }
        this.loader.start();
        this.iframe.src = this.baseFolder + scene;
        this.current = scene;
        this.loader.stop();
    }
}
