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

        // pool of events listeners
        this.pool = {};
    },

    init: function() {
        // setting listeners
        this.setListener();
    },

    afterSceneCreation: function() {
        // domEvent from threex
        this.meshEvents = new THREEx.DomEvents(app.sm.camera, app.sm.container);
    },

    setListener: function() {
        //setting onykeydown listener
        document.addEventListener("keydown", app.interface.onkeydown, false);
        //setting resize event listener
        window.addEventListener('resize', app.sm.onWindowResize, false);
        //setting mousedown event listener
        app.sm.container.addEventListener("mousedown", app.mm.onMouseDown, false);
        /*window.addEventListener( "resize", function(event) {
            app.interface.on("resize", event);
        }, false);
        window.addEventListener( "mousedown", function() {
            app.interface.on("mousedown", event);
        }, false );
        window.addEventListener( "touchstart", function(event) {
            app.interface.on("touchstart", event);
        }, false );
        window.addEventListener( "mousemove", function(event) {
            app.interface.on("mousemove", event);
        }, false );
        window.addEventListener( "touchmove", function(event) {
            app.interface.on("touchmove", event);
        }, false );
        window.addEventListener( "mousemove", function(event) {
            app.interface.on("mousemove", event);
        }, false );
        window.addEventListener( "touchmove", function(event) {
            app.interface.on("touchmove", event);
        }, false );
        window.addEventListener( "mouseup", function(event) {
            app.interface.on("mouseup", event);
        }, false );
        window.addEventListener( "mouseout", function(event) {
            app.interface.on("mouseout", event);
        }, false );
        window.addEventListener( "touchend", function(event) {
            app.interface.on("touchend", event);
        }, false );
        window.addEventListener( "touchcancel", function(event) {
            app.interface.on("touchcancel", event);
        }, false );
        window.addEventListener( "touchleave", function(event) {
            app.interface.on("touchleave", event);
        }, false );
        window.addEventListener( "contextmenu", function(event) {
            app.interface.on("contextmenu", event);
        }, false );
        window.addEventListener( "DOMMouseScroll", function(event) {
            app.interface.on("DOMMouseScroll", event);
        }, false );*/
    },

    addEventListener: function(eventName, method) {
        //every eventName has a list of methods to be called
        if (!app.interface.pool[eventName]) {
            app.interface.pool[eventName] = [];
        }
        app.interface.pool[eventName].push(method);
    },

    on: function(eventName, event) {
        //general event listener, will call each
        if (!app.interface.pool[eventName]) return;
        for (var i=0; i<app.interface.pool[eventName].length; i++) {
            app.interface.pool[eventName][i](event);
        }
    },

    onkeydown: function(event) {
        app.interface.toggleColumns(""+event.keyCode);
        app.sm.handleInput(event.keyCode);
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