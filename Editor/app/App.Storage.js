Class("Storage", {
    Storage: function() {
        this.keys = {
            "lights": "lm",
            "meshes": "mm"
        };
        this.lastTime = new Date();
        this.autoSave = false;
        this.autoSaveId = undefined;
        this.autoSaveTimer = 10000; //saving every 10 seconds
        this.currentProject = (localStorage.getItem("currentProject")) ? localStorage.getItem("currentProject") : "BaseProject"; //reference to current project
    },

    //Setting listeners if we want auto save or not
    setListeners: function() {
        app.interface.events.autosaveChange.add(this.onAutosaveChange);
    },

    //listenning for autosave toggle
    onAutosaveChange: function(flag) {
        app.storage.autoSave = flag;
        if (flag) {
            //setting setInterval
            if (app.storage.autoSaveId) clearInterval(app.storage.autoSaveId);
            app.storage.autoSaveId = setInterval(app.storage.save, app.storage.autoSaveTimer);
        } else {
            //just clearing our timer
            if (app.storage.autoSaveId) clearInterval(app.storage.autoSaveId);
        }
    },

    load: function(projectName) {
        //getting elements
        var toReturn = {};
        for (k in app.storage.keys) {
            //getting json version of our map
            toReturn[app.storage.currentProject+"_"+k] = JSON.parse(app.storage.get(app.storage.currentProject+"_"+k));
        }
        //returning toReturn
        return toReturn;
    },

    //save elements
    save: function() {
        //sending save started event
        app.interface.events.saveStarted.dispatch();
        //storing elements
        for (k in app.storage.keys) {
            //getting json version of our map
            var value = JSON.stringify(app[app.storage.keys[k]].map);
            app.storage.set(app.storage.currentProject+"_"+k, value);
        }
        //saving lastTime we did a save
        app.storage.lastTime = new Date();
        //triggering saveEvent event
        app.interface.events.saveEvent.dispatch();
    },

    //basic method to store elements
    set: function(key, value) {
        //using localstorage
        // what happens when we don't have localstorage? -> node-webkit HAS localstorage, you idiot
        localStorage.setItem(key, value);
    },

    //getting elements from localstorage
    get: function(key) {
        return localStorage.getItem(key);
    },

    //clearing all data for this project
    clear: function() {
        for (k in app.storage.keys) {
            //getting json version of our map
            app.storage.set(app.storage.currentProject+"_"+k, null);
        }
    },

    //wiping all data stored
    clearAll: function() {
        localStorage.clear();
    }
})