Class("Interface", {
    Interface: function() {
        //list of recognizable keys
        this.recognizableKeys = [
            49, // 1
            50, // 2
            87, // w
            69, // e
            81, // q
            82, // r
            187,
            107, // + = num+
            189,
            10, // - _ num-
            68 // d
        ];

        //flag for modal showing
        this.isModalShowing = false;

        // pool of events listeners
        this.pool = {};

        //using signals to dispatch events
        this.events = {
            //triggered when "1" button is clicked
            columnToggle: new signals.Signal(),
            //transform space change
            transformSpaceChange: new signals.Signal(),
            //transform mode change
            transformModeChange: new signals.Signal(),
            //transform size change
            transformSizeChange: new signals.Signal(),
            //on deselect all
            deselectedAll: new signals.Signal()
        };
    },

    init: function() {
        //creating sidebars
        this.leftSidebar = new LeftSidebar();
        this.rightSidebar = new RightSidebar();
        this.sidebarHelper = new HelperSidebar();
        // setting listeners
        this.setListeners();
    },

    afterSceneCreation: function() {
        // domEvent from threex
        this.meshEvents = new THREEx.DomEvents(app.sm.camera, app.sm.container);
    },

    setListeners: function() {
        //setting listeners for interface objects
        this.leftSidebar.setListeners();
        this.rightSidebar.setListeners();
        //setting onykeydown listener
        document.addEventListener("keydown", app.interface.onKeyDown, false);
        //setting resize event listener
        window.addEventListener('resize', app.interface.onWindowResize, false);
        //setting mousedown event listener
        window.addEventListener("mousedown", app.interface.onMouseDown, false);
        //setting listeners for modals events
        $('.wagemodal').on("show.bs.modal", function() {
            app.interface.isModalShowing = true;
        });
        $('.wagemodal').on("hide.bs.modal", function() {
            app.interface.isModalShowing = false;
        });
    },

    //listeners

    onKeyDown: function(event) {
        //app.interface.toggleColumns(""+event.keyCode);
        //app.sm.handleInput(event.keyCode);
        if (app.interface.recognizableKeys.indexOf(event.keyCode)!= -1) {
            switch(event.keyCode) {
                case 50:
                case 49:
                    //1 = 49, 2 = 50
                    app.interface.events.columnToggle.dispatch(""+event.keyCode);
                    break;
                case 81: // Q
                    app.interface.events.transformSpaceChange.dispatch();
                    break;
                case 87: // W
                    app.interface.events.transformModeChange.dispatch("translate");
                    break;
                case 69: // E
                    app.interface.events.transformModeChange.dispatch("rotate");
                    break;
                case 82: // R
                    app.interface.events.transformModeChange.dispatch("scale");
                    break;
                case 187:
                case 107: // +,=,num+
                    app.interface.events.transformSizeChange.dispatch(true);
                    break;
                case 189:
                case 10: // -,_,num-
                    app.interface.events.transformSizeChange.dispatch(false);
                    break;
                case 68:
                    //deselect
                    app.sm.deselect();
                    break;
            }
        }
    },

    onWindowResize: function(event) {
        app.sm.onWindowResize(event);
    },

    onMouseDown: function(event) {
        //app.mm.onMouseDown(event);
    }
});