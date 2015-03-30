window.onload = function() {
    include([
        "app/lib/jsColorPicker.min",
        "app/Interface",
        "app/Manager.Scene",
        "app/Manager.Mesh",
        "app/Manager.Light",
        "app/Manager.Model",
        "app/Interface.Sidebar",
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
        },

        init: function() {
            this.interface.init();
            this.sm.init();
            this.interface.afterSceneCreation();
        },

        setListeners: function() {
            this.interface.setListeners();
            this.sm.setListeners();
            this.lm.setListeners();
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
    }, function() {
        //on check failure
    });
}

