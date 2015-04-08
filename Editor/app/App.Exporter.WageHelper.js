Class("WageHelper", {
    WageHelper: function(data) {
        this.lights = data[app.storage.currentProject+"_lights"];
        this.meshes = data[app.storage.currentProject+"_meshes"];
        //flags
        this.meshesFlag = (this.meshes.keys.length > 0);
        this.lightsFlag = (this.lights.keys.length > 0); // true/false whether we recovered something or not
    },

    begin: function() {
        //for every mesh and light we use a different class depending on each group
        var groups = [];
        for (var i=0; i<this.meshes.total; i++) {
            
        }

    },

    _writeMain: function() {
        var text = "";
    }
});