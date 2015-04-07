Class("WageHelper", {
    WageHelper: function() {
        //check if there's something to restore or not
        this.nothingToRestore = false;
        for (var k in app.storage.keys) {
            if (!data[app.storage.currentProject+"_"+k]) {
                this.nothingToRestore = true;
                return;
            }
        }
        this.lights = data[app.storage.currentProject+"_lights"];
        this.meshes = data[app.storage.currentProject+"_meshes"];
        //flags
        this.meshesFlag = (this.meshes.keys.length > 0);
        this.lightsFlag = (this.lights.keys.length > 0); // true/false whether we recovered something or not
    },

    begin: function() {
        //for every mesh and light we use a different class depending on each group
    }

    _writeMain: function() {
        var text = "";
    }
});