include("app/Interface");

Class("Editor", {
    Editor: function() {
        this.interface = new Interface();
    },

    init: function() {
        this.interface.init();
    }
});

// App object
var app;
window.onload = function() {
    app = new Editor();
    app.init();
};