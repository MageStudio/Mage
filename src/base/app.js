Class("App", {

    App: function() {

        this.log_types = {
    		"e" : "error",
    		"w" : "warn",
    		"i" : "info"
    	};

        //util
        this.util = {
    		h : window.innerHeight,
    		w : window.innerWidth,
    		ratio : (window.innerWidth/window.innerHeight),
    		frameRate : 60,

    		camera : {
    			//handling useful informations about our camera.
    			fov : 75,
    			near : 0.1,
    			far : 100
    		}
    	};

    	//importing libraries
    	this.threeLib = undefined;

    	//scnee parameters
        this.camera = undefined;
        this.user = undefined;
        this.scene = undefined;
        this.renderer= undefined;
        this.clearColor = 0x000000;
        Object.defineProperty(this, 'clearColor', {
            set: function(value) {
                try {
                    if (this.renderer) {
                        this.renderer.setClearColor(value);
                        this.clearColor = value;
                    }
                } catch (e) {}
            }
        })

    	//debug mode
        this.debug = true;

        //CLOCK!
        this.clock = new THREE.Clock();

        //window and mouse variables
        this.mouseX = 0;
        this.mouseY = 0;
        this.zoom = 0;

        this.windowHalfX = window.innerWidth / 2;
        this.windowHalfY = window.innerHeight / 2;
        this.CAMERA_MAX_Z = 1000;
        this.CAMERA_MIN_Z = 250;

        // registering listener for events from parent
        window.addEventListener("onmessage", this.onMessage, false);
        window.addEventListener("message", this.onMessage, false);

    },

    //onCreate method, ovveride to start creating stuff
    onCreate: function() {},

    //this methods helps you loading heavy stuff
    preload: function(callback) {
        callback();
    },

    //do stuff before onCreate method( prepare meshes, whatever )
    prepareScene: function() {},

    //this is what happens during game loading, the progress animation
    progressAnimation: function(callback) {
        $('#loader').animate({"opacity" : "0", "margin-top" : "250px"}, 1000 , function () {
    		$('#loader').remove();
    		$('body').animate({backgroundColor : "#fff"}, 200 , callback);
    	});
    },

    //needed if user wants to add a customRender method
    _render: function() {},

    //setupleap motion device
    setUpLeap: function() {},

    //leap motion socket connected
    onLeapSocketConnected: function() {},

    //leap motion device connected
    onLeapDeviceConnected: function() {},

    //leap motion device disconnected
    onLeapDeviceDisconnected: function() {},

    render : function () {

        //handling user input
        User.handleUserInput();
        //updating game and engines
        Game.update();
        AudioEngine.update();
        LightEngine.update();
        //updating universe
        Universe.update();
        Control.update();

        //updating camera if we need to do so.
        if (app.camera.update) {
            app.camera.update(app.clock.getDelta());
        }

        app.renderer.autoClear = false;
        app.renderer.clear(app.clearColor);
        app._render();
        app.renderer.render(app.scene, app.camera.object);

        setTimeout(function() {
            if (config.physics_enabled) {
                if (Physijs._isLoaded) {
                    app.scene.simulate();
                }
            }
            if (config.tween_enabled) {
                TWEEN.update();
            }
            requestAnimFrame(app.render);
        }, 1000 / app.util.frameRate);

    },

    add : function(mesh, element) {

		//method to be called when creating a new element
		this.scene.add(mesh);
		Universe.universe.put(mesh.uuid, element);

	},

	remove : function(mesh) {

		this.scene.remove(mesh);
		Universe.universe.remove(mesh.uuid);

	},

    init: function() {

        app.three = THREE;
        var c_util 	= app.util.camera; //camera util
        var util 	= app.util;

        if (window.keypress) {
            app._keylistener =  new window.keypress.Listener();
        }

        //try{
            //configuring threejs and physijs
            if (config) {
                app.log("config loaded");
                if (config.physics_enabled) {
                    app.log("physics enabled.");
                    try {
                        Physijs.scripts.worker = 'workers/physijs_worker.js';
                        Physijs.scripts.ammo = 'ammo.js';
                        app.scene = new Physijs.Scene();
                        Physijs._isLoaded = true;
                    } catch (ex) {
                        app.log("something bad trying to create physijs scene", "e");
                        app.log(ex);
                        Physijs._isLoaded = false;
                        app.scene = new app.three.Scene();
                    }
                } else {
                    app.log("physics not enabled.");
                    Physijs._isLoaded = false;
                    app.scene = new app.three.Scene();
                }
            } else {
                app.log("config not loaded, switching to three.js");
                Physijs._isLoaded = false;
                app.scene = new app.three.Scene();
            }
            //setting up camera
            var cameraOptions = {
                fov : c_util.fov,
                ratio : util.ratio,
                near : c_util.near,
                far : c_util.far
            };
            if (config) {
                if (config.camera) {
                    cameraOptions.fov = config.camera.fov ? config.camera.fov : cameraOptions.fov;
                    cameraOptions.ratio = config.camera.ratio ? config.camera.ratio : cameraOptions.ratio;
                    cameraOptions.near = config.camera.near ? config.camera.near : cameraOptions.near;
                    cameraOptions.far = config.camera.far ? config.camera.far : cameraOptions.far;
                }
            }
            app.camera = new Camera(cameraOptions);
            var alphaRenderer = false;
            if (config.alpha) {
                alphaRenderer = true;
            }
            app.renderer = new app.three.WebGLRenderer({alpha:alphaRenderer});
            if (config) {
                if (config.cast_shadow == true) {
                    app.renderer.shadowMap.enabled = true;
                    app.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
                }
            }
            app.renderer.setSize( util.w , util.h );
            //document.body.appendChild( app.renderer.domElement );
            document.getElementById("gameContainer").appendChild(app.renderer.domElement);
            //handling user input
            User.handleUserInput();
            //updating game
            Game.update();
            //updating universe
            Universe.update();

            //launch render method
            Control.init();
            app.render();

            //we are pretty sure we can add stuff to our universe
            if (app.onCreate instanceof Function) {
                app.onCreate();
            } else {
                console.log("Something wrong in your onCreate method");
            }

        //} catch( error ) {
        //	console.error(error);
        //	console.trace();
        //}

    },

    load: function() {

        console.log("inside load");
        if (!(typeof this.progressAnimation == "function")) {
            this.progressAnimation = function(callback) {
                console.log("def progressAnimation");
                callback();
            }
        }
        this.progressAnimation(app.init);

    },

    sendMessage: function(message) {
		parent.postMessage(message, location.origin);
    },

    onMessage: function() {
        var origin = event.origin || event.originalEvent.origin;
        if (origin !== location.origin)
            return;

    },

    onkey: function(key, callback) {
        if (app._keylistener) {
            app._keylistener.simple_combo(key, callback);
        }
    },

    //utilities methods
    log: function() {

    	if (this.debug) {
    		if (arguments.length>1) {
    			if (arguments[1] in this.log_types) {
    				console[this.log_types[arguments[1]]](arguments[0]);
    			} else {
    				console.log(arguments[0]);
    			}
    		} else {
    			console.log(arguments[0]);
    		}
    	}

    },

    //document input method
    onDocumentMouseWheel: function(event) {

    	event.preventDefault();
    	app.zoom = event.wheelDelta * 0.05;
    	app.camera.object.position.z += app.zoom;

    },

    onDocumentMouseMove: function(event) {

    	app.mouseX = event.clientX - app.windowHalfX;
    	app.mouseY = event.clientY - app.windowHalfY;

    },

    onDocumentTouchStart: function(event) {

    	if ( event.touches.length === 1 ) {

    		event.preventDefault();

    		app.mouseX = event.touches[ 0 ].pageX - app.windowHalfX;
    		app.mouseY = event.touches[ 0 ].pageY - app.windowHalfY;

    	}

    },

    onDocumentTouchMove: function(event) {

    	if ( event.touches.length === 1 ) {

    		event.preventDefault();

    		app.mouseX = event.touches[ 0 ].pageX - app.windowHalfX;
    		app.mouseY = event.touches[ 0 ].pageY - app.windowHalfY;

    	}

    },

    //keyup event
    keyup: function(event) {},

    //keydown event
    keydown: function(event) {},

    //handling failed tests
    onFailedTest: function(message, test) {},

    //handling succesful tests
    onSuccededTest: function(message) {}

});

var app;

window.onload = function() {

    console.log("inside window onload");
    //creating app object
    if (window.subClasses["App"]) {
        var subName = window.subClasses["App"];
        app = new window[subName]();
    } else {
        app = new App();
    }

    //before starting loading stuff, be sure to pass all tests
    Util.start();

    if (Util.check.start(app.onSuccededTest, app.onFailedTest)) {
        //we passed every test, we can go
        app.preload(function() {
            AssetsManager.load(function() {
                app.prepareScene();
                app.load();
            });
        });
    }

};

window.onresize = function() {

    app.util.h 	= window.innerHeight;
    app.util.w 	= window.innerWidth;
    app.util.ratio = app.util.w/app.util.h;

    if (!app.camera || !app.renderer) return;
    app.camera.object.aspect = app.util.ratio;
    app.camera.object.updateProjectionMatrix();
    app.renderer.setSize(app.util.w, app.util.h);

};
