Class("Interface", {
    Interface: function() {
        //initializing keyboard object
        this.keys = new Keyboard();
        //list of recognizable keys
        this.recognizableKeys = [
            this.keys.map.NUM_1, // 1
            this.keys.map.NUM_2, // 2
            this.keys.map.KEY_W, // w
            this.keys.map.KEY_S, // s
            this.keys.map.KEY_M, // m
            this.keys.map.KEY_E, // e
            this.keys.map.KEY_Q, // q
            this.keys.map.KEY_R, // r
            this.keys.map.KEY_PLUS,
            this.keys.map.KEY_NUMPAD_PLUS, // + = num+
            this.keys.map.KEY_MINUS,
            this.keys.map.KEY_NUMPAD_MINUS, // - _ num-
            this.keys.map.KEY_D // d
        ];

        //flag for modal showing
        this.disableEvents = false;
        this.colorPickerClicked = undefined;

        // pool of events listeners
        this.pool = {};

        //using signals to dispatch events
        this.events = {
            //new project
            newProject: new signals.Signal(),
            //closing project
            closedProject: new signals.Signal(),
            //loading project
            loadProject: new signals.Signal(),

            //autosave event 
            autosaveChange: new signals.Signal(),
            //Save event
            saveEvent: new signals.Signal(),
            //save started
            saveStarted: new signals.Signal(),
            //load event
            loadEvent: new signals.Signal(),
            //load started
            loadStarted: new signals.Signal(),

            //triggered when "1" button is clicked
            columnToggle: new signals.Signal(),
            //transform space change
            transformSpaceChange: new signals.Signal(),
            //transform mode change
            transformModeChange: new signals.Signal(),
            //transform size change
            transformSizeChange: new signals.Signal(),
            //on deselect all
            deselectedAll: new signals.Signal(),
            //on selected mesh
            selectedMesh: new signals.Signal(),

            //fog enabled/disabled flag
            fogChange: new signals.Signal(),
            //fog color changed event
            fogColorChange: new signals.Signal(),
            //fog density changed event
            fogDensityChange: new signals.Signal(),

            //shadow type changed
            shadowTypeChanged: new signals.Signal(),
            shadowChange: new signals.Signal(),

            //mesh added event
            meshAdded: new signals.Signal(),
            //light added event
            lightAdded: new signals.Signal(),
            //sound added event
            soundAdded: new signals.Signal(),

            //element position change events
            positionChange: new signals.Signal(),
            //element rotation change events
            rotationChange: new signals.Signal(),

            //materials events
            meshWireframeChange: new signals.Signal(),
            meshFogChange: new signals.Signal(),
            meshVisibleChange: new signals.Signal(),
            meshColorChange: new signals.Signal(),
            meshCastShadowChange: new signals.Signal(),
            meshReceiveShadowChange: new signals.Signal(),

            //material changed event
            meshMaterialChange: new signals.Signal(),

            //light shadow events
            lightCastShadowChange: new signals.Signal(),
            lightReceiveShadowChange: new signals.Signal(),
            lightShadowDarknessChange: new signals.Signal(),
            lightShowCameraChange: new signals.Signal(),

            //light events
            lightColorChange: new signals.Signal(),
            lightDistanceChange: new signals.Signal(),
            lightIntensityChange: new signals.Signal(),
            lightVisibleChange: new signals.Signal()


        };

        //flags
        this.flags = {
            //save
            "autosave": false,
            //fog and shadow
            "fog": false,
            "shadow": true,
            //meshes flags
            "mesh": true,
            "meshWireframe": true,
            "meshFog": true,
            "meshVisible": true,
            "meshCastShadow": false,
            "meshReceiveShadow": false,
            //lights
            "light": true,
            "lightCastShadow": false,
            "lightReceiveShadow": false,
            "lightShowCamera": false
        }
    },

    init: function() {
        //creating sidebars
        this.leftSidebar = new LeftSidebar();
        this.rightSidebar = new RightSidebar();
        this.sidebarHelper = new HelperSidebar();
        this.footer = new Footer();
        //creating sidebar loader
        this.loader = new SidebarLoader();
        // setting listeners
        this.setListeners();
    },

    afterSceneCreation: function() {
        // domEvent from threex
        this.meshEvents = new THREEx.DomEvents(app.sm.camera, app.sm.container);

        //setting toggles
        this.leftSidebar.set();

        //Setting footer
        this.footer.set();
    },

    setListeners: function() {
        //setting listeners for interface objects
        this.sidebarHelper.setListeners();
        this.leftSidebar.setListeners();
        this.rightSidebar.setListeners();
        this.loader.setListeners();
        this.footer.setListeners();
        //setting onykeydown listener
        document.addEventListener('keydown', app.interface.onKeyDown, false);
        //setting resize event listener
        window.addEventListener('resize', app.interface.onWindowResize, false);
        //setting mousedown event listener
        window.addEventListener('mousedown', app.interface.onMouseDown, false);
        //setting listeners for modals events
        $('.wagemodal').on('show.bs.modal', function() {
            app.interface.disableEvents = true;
        });
        $('.wagemodal').on('hide.bs.modal', function() {
            app.interface.disableEvents = false;
        });
        //setting listener for collapse event
        $('.settingHeader').on('show.bs.collapse', function() {
            var control = $(this).data("type");
            $('#'+control+'caret').removeClass('fa-caret-right').addClass('fa-caret-down');
        });
        $('.settingHeader').on('hide.bs.collapse', function() {
            var control = $(this).data("type");
            $('#'+control+'caret').removeClass('fa-caret-down').addClass('fa-caret-right');
        });
        
        //setting input events: color, slider checkbox
        this.setInputEvents("#fogColor");
    },

    setInputEvents: function(inputColorId) {
        //setting input color picker
        document.querySelector(inputColorId).addEventListener("click", function() {
            app.interface.colorPickerClicked = this;
            app.interface.disableEvents = true;
        });
        $(inputColorId).ColorPicker({
            color: '#0000ff',
            onShow: function (colpkr) {
                app.interface.disableEvents = true;
                $(colpkr).fadeIn(500);
                return false;
            },
            onHide: function (colpkr) {
                app.interface.disableEvents = false;
                app.interface.colorPickerClicked = undefined;
                $(colpkr).fadeOut(500);
                return false;
            },
            onChange: function (hsb, hex, rgb) {
                if (app.interface.colorPickerClicked) {
                    $(app.interface.colorPickerClicked).css("background", "#"+hex);
                    $(app.interface.colorPickerClicked).val("#"+hex);
                    var toToggle = $(app.interface.colorPickerClicked).data("toggle");
                    if (app.interface.flags[toToggle]) {
                        //controllo se possiamo cambiare il valore in toToggle
                        app.interface.events[toToggle+"ColorChange"].dispatch("#"+hex);
                    }
                }
                app.interface.disableEvents = true;
            }
        });
        //setting all toggles
        $('input[type=checkbox]').unbind().on("click", function(event) {
            //retrieving interface flag
            var flag = $(this).data("flag");
            console.log(flag);
            if (flag in app.interface.flags) {
                //retriving checked status 
                app.interface.flags[flag] = this.checked;
                //triggering event
                console.log(flag+"Change");
                console.log(this.checked);
                app.interface.events[flag+"Change"].dispatch(this.checked);
            }
            event.stopPropagation();
        });
    },

    //listeners

    onKeyDown: function(event) {
        //app.interface.toggleColumns(""+event.keyCode);
        //app.sm.handleInput(event.keyCode);
        if (app.interface.recognizableKeys.indexOf(event.keyCode)!= -1) {
            switch(event.keyCode) {
                case app.interface.keys.map.KEY_S:
                case app.interface.keys.map.KEY_M:
                    app.interface.events.columnToggle.dispatch(""+event.keyCode);
                    break;
                case app.interface.keys.map.KEY_Q: // Q
                    app.interface.events.transformSpaceChange.dispatch();
                    break;
                case app.interface.keys.map.KEY_W:
                    app.interface.events.transformModeChange.dispatch("translate");
                    break;
                case app.interface.keys.map.KEY_E:
                    app.interface.events.transformModeChange.dispatch("rotate");
                    break;
                case app.interface.keys.map.KEY_R:
                    app.interface.events.transformModeChange.dispatch("scale");
                    break;
                case app.interface.keys.map.KEY_PLUS:
                case app.interface.keys.map.KEY_NUMPAD_PLUS:
                    app.interface.events.transformSizeChange.dispatch(true);
                    break;
                case app.interface.keys.map.KEY_MINUS:
                case app.interface.keys.map.KEY_NUMPAD_MINUS: // -,_,num-
                    app.interface.events.transformSizeChange.dispatch(false);
                    break;
                case app.interface.keys.map.KEY_D:
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