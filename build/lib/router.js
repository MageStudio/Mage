var Router = {
    init: function(data) {
        Router.iframe = document.createElement("iframe");
        document.body.appendChild(Router.iframe);

        Router.baseFolder = "scenes/";

        Router.iframe.src = Router.baseFolder + "" + (data.firstScene ? data.firstScene : data.scenes[0].name);

        Router.firstScene = data.firstScene;
        Router.scenes = data.scenes;
        Router.current = data.firstScene;

        window.addEventListener("message", Router._onMessage, false);
        window.addEventListener("onmessage", Router._onMessage, false);
    },

    _onMessage: function(message) {

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
        if (!Router.iframe || !Router._checkScene(scene)) {
            console.error("[ invalid scene ] The scene " + scene + " is not valid");
            return;
        }
        Router.loader.start();
        Router.iframe.src = Router.baseFolder + scene;
        Router.current = scene;
        Router.loader.stop();
    }
}
