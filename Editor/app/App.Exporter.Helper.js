Class("ExporterHelper", {
    ExporterHelper: function() {
        this.fs = require("fs");
    },

    requestDirectory: function(callback) {
        //appending input to body
        var input = document.createElement('input');
        input.id = "directoryChooser";
        input.type = "file";
        input.style.visibility = "hidden";
        input.nwdirectory = true;
        $('body').append(input);
        //setting change listener
        $('#directoryChooser').change(function(event) {
            var dir = event.target.files[0].path;
            if (callback) callback(dir);
        });
        //triggering click
        $('#directoryChooser').click();
    },

    writeAppend: function(path, text, callback) {
        this.fs.open(path, "a", "0666", function(error, descriptor) {
            if (error) return;
            //writing text to file
            app.exporter.helper.fs.write(descriptor, text, callback);
        });
    }
})