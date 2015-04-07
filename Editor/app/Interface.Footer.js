Class("Footer", {
    Footer: function() {
        this.progress = $('#progressBar');
        this.currentProgress = 5;
    },

    set: function() {
        //setting autosave toggle value
        $('#autosaveToggle').attr('checked', app.storage.autoSave);
    },

    setListeners: function() {
        //Disabling other input when on footer
        $('#footer').mouseenter(function() {
            app.interface.disableEvents = true;
        }).mouseleave(function() {
            app.interface.disableEvents = false;
        }).mouseover(function() {
            app.interface.disableEvents = true;
        });
        //registering to save event
        app.interface.events.saveEvent.add(this.onSaveEvent);
        //registering for save started event
        app.interface.events.saveStarted.add(this.onSaveStarted);

        //registering for load event started
        app.interface.events.loadStarted.add(this.onLoadStarted);
        //registering for loadEnded event
        app.interface.events.loadEvent.add(this.onLoadEvent);
    },

    //On save started
    onSaveStarted: function() {
        app.interface.footer.incProgressBar(1, 10);
        $('#status i').removeClass().addClass('fa fa-circle-o-notch fa-spin');
        $('#status span').text("Saving..");
    },

    //on save finished
    onSaveEvent: function() {
        //we are saving the project
        $('#status i').removeClass().addClass('fa fa-check');
        var toPrint = app.storage.lastTime.toJSON().replace("-", "/").replace("-", "/").replace("-", "/").replace("T", " ").split(".")[0]
        $('#status span').text("Saved! " + toPrint);
        app.interface.footer.completeProgressBar();
    },

    //on load started
    onLoadStarted: function() {

    },

    //on load finished
    onLoadEvent: function() {

    },

    incProgressBar: function(step, total, callback) {
        //slightly increasing progress bar size
        var progr = parseInt(step*100/total);
        this.currentProgress = progr;
        var width = progr + "%";
        this.progress.animate({"width": width}, 1000, function() {
            app.interface.footer.progress.text(width);
            if (callback) callback();
        });
    },

    completeProgressBar: function() {
        this.incProgressBar(1, 1, function() {
            app.interface.footer.progress.delay(2000).animate({"width": "0%"}, 100, function() {
                app.interface.footer.progress.text("0%");
            });
        });

    }
})