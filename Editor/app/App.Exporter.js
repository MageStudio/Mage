/*  this is gonna be a huge mess. */
Class("Exporter", {
    Exporter: function() {
        //including necessary modules
        this.ncp = require("ncp").ncp;
        this.fs = require("fs");

        //creating helper
        this.helper = new ExporterHelper();
        this.wageHelper = new WageHelper();
    },

    Android: function() {
        //nothing to do here
    },

    NW: function() {
        //nothing to do here
    },

    wage: function() {
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
                    app.interface.exporter.wageHelper.begin();
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

*/