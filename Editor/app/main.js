include([
    "app/Interface",
    "app/SceneManager"
]);

Class("Editor", {
    Editor: function() {
        this.interface = new Interface();
        this.sm = new SceneManager();
    },

    init: function() {
        this.interface.init();
        this.sm.init();
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