/*  this is gonna be a huge mess. */
Class("Exporter", {
    Exporter: function() {
        //including necessary modules
        var require = window.require || false;  
        if (!require) {
            alert("Exporter not available. Can be used only with standalone package. Please download it.");
            return;
        }
        this.ncp = require("ncp").ncp;
        this.fs = require("fs");

        //creating helper
        this.helper = new ExporterHelper();
        var flags = {
            "lights": false,
            "meshes": false
        };
    },

    fail: function() {
        //check if there's something to restore or not
        var data = app.storage.load();
        var allFailed = true;
        for (var k in app.storage.keys) {
            if (data[app.storage.currentProject+"_"+k]) {
                allFailed = false;
                break;
            }
        }
        return allFailed;
    },

    Android: function() {
        //nothing to do here
    },

    NW: function() {
        //nothing to do here
    },

    wage: function() {
        if (this.fail()) {
            alert("nothing to export!");
            return;
        }
        this.wageHelper = new WageHelper(app.storage.load());
        //requestind directory
        var totalSteps = 10;
        var currentStep = 1;
        app.interface.footer.incProgressBar(currentStep, totalSteps);
        currentStep++;
        app.exporter.helper.requestDirectory(function(dir) {
            //we chose directory
            var directory = dir;
            app.interface.footer.incProgressBar(currentStep, totalSteps);
            currentStep++;
            //now copying the exporter_scaffold/wage folder to path
            app.exporter.ncp("exporter_scaffolds/wage", directory, function (err) {
                if (err) {
                    //#TODO replace alerts with custom modals
                    alert("Something went wrong!");
                    return;
                } else {
                    app.interface.footer.incProgressBar(currentStep, totalSteps);
                    currentStep++;
                    //begin wage process
                    app.exporter.wageHelper.begin();
                }
            });
        });
    }

});

/*
    procedure:
        1 requesting for directory
        2 when directory is ready, proceed

        wage: 
            copy build folder to destination
            create classes and objects

        android: ??
            we have to use phonegap
            and know where android folder is

        ios: ??

        nw: ??

        create scene
        add lights and objects
        create renderer;
        start

*/