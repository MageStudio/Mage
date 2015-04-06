Class("Footer", {
    Footer: function() {

    },

    set: function() {
        //setting autosave toggle value
        $('#autosaveToggle').attr('checked', app.storage.autoSave);
    },

    setListeners: function() {
        //registering to save event
        app.interface.events.saveEvent.add(this.onSaveEvent);
        //registering for save started event
        app.interface.events.saveStarted.add(this.onSaveStarted);
    },

    //On save started
    onSaveStarted: function() {
        console.log("save started");
        $('#status i').removeClass().addClass('fa fa-circle-o-notch fa-spin');
        $('#status span').text("Saving..");
    },

    //on save finished
    onSaveEvent: function() {
        //we are saving the project
        $('#status i').removeClass().addClass('fa fa-check');
        var toPrint = app.storage.lastTime.toJSON().replace("-", "/").replace("-", "/").replace("-", "/").replace("T", " ").split(".")[0]
        $('#status span').text("Saved! " + toPrint);
    }
})