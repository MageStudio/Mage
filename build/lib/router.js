var Router = {
    init: function(data) {
        if (window && window.process && window.process.type) {
            Router.element = document.createElement('webview');
            Router.disablewebsecurity = true;
        } else {
            Router.element = document.createElement('iframe');
        }

        document.body.appendChild(Router.element);

        Router.baseFolder = "scenes/";

        Router.element.src = Router.baseFolder + "" + (data.firstScene ? data.firstScene : data.scenes[0].name) + "/index.html";

        Router.firstScene = data.firstScene;
        Router.scenes = data.scenes;
        Router.current = data.firstScene;

        Router.actions = ['changeScene'];

        window.addEventListener("message", Router._onMessage, false);
        window.addEventListener("onmessage", Router._onMessage, false);
    },

    _onMessage: function(message) {
        console.log(message);
    },

    _checkScene: function(scene) {
        for (var i=0; i<Router.scenes.length; i++) {
            if (Router.scenes[i].name == scene) return true;
        }
        return false;
    },

    loader: {
        className: "game-loader",

        start: function() {
            Router.loader.element = document.createElement("div");
            Router.loader.element.className = Router.loader.className;
            document.body.appendChild(Router.loader.element);
            Router.loader.element.style.opacity = "1";
        },
        stop: function() {
            Router.loader.element.style.opacity = "1";
            setTimeout(function() {
                document.body.removeChild(Router.loader.element);
            }, 250);
        }
    },

    changeScene: function(scene) {
        if (!Router.element || !Router._checkScene(scene)) {
            console.error("[ invalid scene ] The scene " + scene + " is not valid");
            return;
        }
        Router.loader.start();
        Router.element.src = Router.baseFolder + scene;
        Router.current = scene;
        Router.loader.stop();
    }
}
