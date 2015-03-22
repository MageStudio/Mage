Class("Interface", {
    Interface: function() {
        //column helper, should be in column handler class
        this.columnsHelper = {
            "11": ["16%", "68%", "16%"],
            "01": ["0%", "84%", "16%"],
            "10": ["16%", "84%", "0%"],
            "00": ["0%", "100%", "0%"]
        };
        this.columnChanger = {
            "11": {
                "49": ["01", "left-column"],
                "50": ["10", "right-column"]
            },
            "01": {
                "49": ["11", ""],
                "50": ["00", "both"]
            },
            "10": {
                "49": ["00", "both"],
                "50": ["11", ""]
            },
            "00": {
                "49": ["10", "right-column"],
                "50": ["01", "left-column"]
            }
        };
        this.currentColumns = "11";

        this.recognizableKeys = ["49", "50"];
    },

    init: function() {
        this.setListener();
    },

    setListener: function() {
        //setting onykeydown listener
        document.onkeydown = this.onkeydown;
        //setting resize event listener
        window.addEventListener( 'resize', app.sm.onWindowResize, false );
    },

    onkeydown: function(event) {
        app.interface.toggleColumns(""+event.keyCode);
    },
    //this should be in column handler class
    toggleColumns: function(code) {
        if (app.interface.recognizableKeys.indexOf(code) != -1) {
            var change = app.interface.columnChanger[this.currentColumns][code][0];
            var toHide = app.interface.columnChanger[this.currentColumns][code][1];
            this.currentColumns = change;
            var widths = app.interface.columnsHelper[this.currentColumns];
            //removing hidden class
            $("#left-column").removeClass("hidden");
            $("#center").removeClass("hidden");
            $("#right-column").removeClass("hidden");
            //updating columns width
            $("#left-column").animate({"width": widths[0]}, 200);
            $('#center').css({'width': widths[1]});
            $('#right-column').animate({'width': widths[2]}, 200);
            //adding proper hidden class
            if (toHide == "") return;
            if (toHide == "both") {
                $('#left-column').addClass("hidden");
                $('#right-column').addClass("hidden");
            } else {
                $('#'+toHide).addClass("hidden");
            }
            //also updating scene manager
            app.sm.onWindowResize();
        } else {
            //not recognized
            console.log("not a recognizable key");
        }
    }
});