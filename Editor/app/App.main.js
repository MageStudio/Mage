include([
    "app/Interface",
    "app/Manager.Scene",
    "app/Manager.Mesh",
    "app/Manager.Light",
    "app/Manager.Model"
]);

Class("Editor", {
    Editor: function() {
        this.interface = new Interface();
        this.sm = new SceneManager();
        this.mm = new MeshManager();
    },

    init: function() {
        this.interface.init();
        this.sm.init();
        this.interface.afterSceneCreation();
    }
});

// App object
var app;
window.onload = function() {
    Util.start();
    Util.check.start(function() {
        //on check success
        app = new Editor();
        app.init();
    }, function() {
        //on check failure
    });
};