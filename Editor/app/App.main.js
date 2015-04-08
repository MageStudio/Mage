window.onload = function() {
    include([
        "app/lib/jsColorPicker.min",
        "app/App.Global",
        "app/App.Restorer",
        "app/App.Storage",
        "app/App.Exporter",
        "app/App.Exporter.Helper",
        "app/App.Exporter.WageHelper",
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
            //interface
            this.interface = new Interface();
            //scene manager
            this.sm = new SceneManager();
            //mesh manager
            this.mm = new MeshManager();
            //light manager
            this.lm = new LightManager();
            //util
            this.util = new Global();
            //storage
            this.storage = new Storage();
            //check if new project or not
            if (this.storage.currentProject == "BaseProject") {
                this.storage.currentProject = prompt("Choose project's name.");
                this.storage.set("currentProject", this.storage.currentProject);
            }
        },

        init: function() {
            this.interface.init();
            this.sm.init();
            this.interface.afterSceneCreation();
            //restorer
            this.restorer = new Restorer(this.storage.load());
            //exporter
            this.exporter = new Exporter();
        },

        setListeners: function() {
            this.interface.setListeners();
            this.sm.setListeners();
            this.lm.setListeners();
            this.storage.setListeners();
        },

        new: function() {
            var projectName = prompt("Choose project's name.");
            app.storage.currentProject = projectName;
            app.storage.set("currentProject", projectName);
            //stopping animation
            cancelAnimationFrame(app.sm.animId);
            app.sm.renderer.domElement.addEventListener('dblclick', null, false);//remove listener to render
            app.sm.scene = null;
            app.sm.projector = null;
            app.sm.camera = null;
            app.sm.controls = null;
            app.sm.transformControl = null;
            var empty = function(element) {
                while (element.lastChild) element.removeChild(element.lastChild);
            }
            empty(app.sm.container);
            //wiping all stored data
            app.storage.clear();
            //trying to recreate scene
            app.sm.init();
            //dispatching new project signal
            app.interface.events.newProject.dispatch();
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

