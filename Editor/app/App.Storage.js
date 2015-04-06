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

    save: function() {
        //sending save started event
        app.interface.events.saveStarted.dispatch();
        //storing elements
        for (k in app.storage.keys) {
            //getting json version of our map
            var value = JSON.stringify(app[app.storage.keys[k]].map);
            app.storage.set(k, value);
        }
        //saving lastTime we did a save
        app.storage.lastTime = new Date();
        //triggering saveEvent event
        app.interface.events.saveEvent.dispatch();
    },

    set: function(key, value) {
        //using localstorage
        // what happens when we don't have localstorage?
        localStorage.setItem(key, value);
    },

    get: function(key) {
        return localStorage.getItem(key);
    }
})