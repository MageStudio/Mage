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
        this.camera 	= undefined;
        this.user 	= undefined;
        this.scene 	= undefined;
        this.renderer= undefined;

    	//debug mode
        this.debug = true;

        //CLOCK!
        this.clock = new THREE.Clock();

    },

    //onCreate method, ovveride to start creating stuff
    onCreate: function() {},

    //this methods helps you loading heavy stuff
    preLoad: function(callback) {
        callback();
    },

    //do stuff before onCreate method( prepare meshes, whatever )
    prepareScene: function() {},

    //this is what happens during game loading, the progress animation
    progressAnimation: function() {
        $('#loader').animate({"opacity" : "0", "margin-top" : "250px"}, 1000 , function () {
    		$('#loader').remove();
    		$('body').animate({backgroundColor : "#fff"}, 200 , callback);
    	});
    },

    //needed if user wants to add a customRender method
    customRender: function() {},

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
        if (this.camera.update) {
            this.update(this.clock.getDelta());
        }

        setTimeout(function() {
            if (config.physics_enabled) {
                if (Physijs._isLoaded) {
                    app.scene.simulate();
                }
            }
            if (config.tween_enabled) {
                TWEEN.update();
            }
            requestAnimationFrame(app.render);
        }, 1000 / app.util.frameRate);

        app.renderer.autoClear = false;
        app.renderer.clear();
        this.customRender();
        app.renderer.render(app.scene, app.camera.object);

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

        var createScene = function () {

            app.threeLib = THREE;
            var c_util 	= app.util.camera; //camera util
            var util 	= app.util;
            var t 		= app.threeLib;

            try{
                //configuring threejs and physijs
                if (config) {
                    this.log("config loaded");
                    if (config.physics_enabled) {
                        this.log("physics enabled.");
                        try {
                            Physijs.scripts.worker = 'workers/physijs_worker.js';
                            Physijs.scripts.ammo = 'ammo.js';
                            this.scene = new Physijs.Scene();
                            Physijs._isLoaded = true;
                        } catch (ex) {
                            this.log("something bad trying to create physijs scene", "e");
                            this.log(ex);
                            Physijs._isLoaded = false;
                            this.scene = new t.Scene();
                        }
                    } else {
                        this.log("physics not enabled.");
                        Physijs._isLoaded = false;
                        this.scene = new t.Scene();
                    }
                } else {
                    this.log("config not loaded, switching to three.js");
                    Physijs._isLoaded = false;
                    this.scene = new t.Scene();
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
                this.camera = new Camera(cameraOptions);
                var alphaRenderer = false;
                if (config.alpha) {
                    alphaRenderer = true;
                }
                this.renderer = new t.WebGLRenderer({alpha:alphaRenderer});
                if (config) {
                    if (config.cast_shadow == true) {
                        this.renderer.shadowMapEnabled = true;
                        this.renderer.shadowMapType = THREE.PCFSoftShadowMap;
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
                if (this.onCreate instanceof Function) {
                    this.onCreate();
                } else {
                    console.log("Something wrong in your onCreate method");
                }

            } catch( error ) {
            	console.error(error);
            	console.trace();
            }
        }

    },

    load: function() {

        console.log("inside load");
        if (!(typeof this.progressAnimation == "function")) {
            this.progressAnimation = function(callback) {
                console.log("def progressAnimation");
                callback();
            }
        }
        this.progressAnimation(createScene);

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

});

var app;

window.onload = function() {

    console.log("inside window onload");
    //creating app object
    app = new App();
    app.init();

    app.preload(function() {
        AssetsManager.load(function() {
            app.prepareScene();
            app.load();
        });
    });

};

window.onresize = function() {

    app.util.h 	= window.innerHeight;
    app.util.w 	= window.innerWidth;
    app.util.ratio = app.util.w/app.util.h;

    app.camera.object.aspect = app.util.ratio;
    app.camera.object.updateProjectionMatrix();
    app.renderer.setSize(app.util.w, app.util.h);

};
