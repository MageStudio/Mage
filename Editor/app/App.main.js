window.onload = function() {
    include([
        "app/lib/jsColorPicker.min",
        "app/App.Global",
        "app/App.Restorer",
        "app/App.Storage",
        "app/Interface",
        "app/Manager.Scene",
        "app/Manager.Mesh",
        "app/Manager.Light",
        "app/Manager.Model",
        "app/Input.Keyboard",
        "app/Interface.Footer",
        "app/Interface.Sidebar",
        "app/Interface.Sidebar.MeshListener",
        "app/Interface.Sidebar.LightListener",
        "app/Interface.Sidebar.Loader",
        "app/Interface.Sidebar.Helper",
        "app/Interface.Sidebar.Right",
        "app/Interface.Sidebar.Left"
    ], start);
}

function start() {

    Class("Editor", {
        Editor: function() {
            this.interface = new Interface();
            this.sm = new SceneManager();
            this.mm = new MeshManager();
            this.lm = new LightManager();
            this.util = new Global();
            this.storage = new Storage();
        },

        init: function() {
            this.interface.init();
            this.sm.init();
            this.interface.afterSceneCreation();
            //restorer
            this.restorer = new Restorer(this.storage.load());
        },

        setListeners: function() {
            this.interface.setListeners();
            this.sm.setListeners();
            this.lm.setListeners();
            this.storage.setListeners();
        }
    });

    // App object
    window.app = {};
    Util.start();
    Util.check.start(function() {
        //on check success
        app = new Editor();
        app.init();
        app.setListeners();
        //trying to restore old data
        app.restorer.restore();
    }, function() {
        //on check failure
    });
}

