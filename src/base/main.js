export default class App {

    constructor() {

        this.log_types = {
    		"e" : "error",
    		"w" : "warn",
    		"i" : "info"
    	};

        //util
        this.util = _.extend({
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
    	}, config);

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

    }

    //onCreate method, ovveride to start creating stuff
    onCreate() {}

    //this methods helps you loading heavy stuff
    preload(callback) {
        callback();
    }

    //do stuff before onCreate method( prepare meshes, whatever )
    prepareScene() {}

    //this is what happens during game loading, the progress animation
    progressAnimation(callback) {
        $('#loader').animate({"opacity" : "0", "margin-top" : "250px"}, 1000 , function () {
    		$('#loader').remove();
    		$('body').animate({backgroundColor : "#fff"}, 200 , callback);
    	});
    }

    //needed if user wants to add a customRender method
    _render() {}

    //setupleap motion device
    setUpLeap() {}

    //leap motion socket connected
    onLeapSocketConnected() {}

    //leap motion device connected
    onLeapDeviceConnected() {}

    //leap motion device disconnected
    onLeapDeviceDisconnected() {}

    render() {

        //handling user input
        //M.user.handleUserInput();
        //updating game and engines
        M.game.update();
        M.audioEngine.update();
        M.lightEngine.update();
        //updating universe
        M.universe.update();
        M.control.update();

        //updating camera if we need to do so.
        if (this.camera.update) {
            this.camera.update(this.clock.getDelta());
        }

        this.renderer.autoClear = false;
        this.renderer.clear(this.clearColor);
        this._render();
        this.renderer.render(this.scene, this.camera.object);

        /*
        setTimeout(function() {
            if (app.util.physics_enabled) {
                if (Physijs._isLoaded) {
                    app.scene.simulate();
                }
            }
            if (app.util.tween_enabled) {
                TWEEN.update();
            }
            requestAnimFrame(app.render);
        }, 1000 / app.util.frameRate);
        */
        if (this.util.physics_enabled && Physijs._isLoaded) {
            this.scene.simulate();
        }
        if (this.util.tween_enabled) {
            TWEEN.update();
        }
        requestAnimFrame(this.render.bind(this));

    }

    add(mesh, element) {
		this.scene.add(mesh);
		M.universe.reality.put(mesh.uuid, element);
	}

	remove(mesh) {
		this.scene.remove(mesh);
		M.universe.reality.remove(mesh.uuid);
	}

    init() {

        this.three = THREE;
        var c_util = this.util.camera; //camera util
        var util = this.util;

        if (window.keypress) {
            this._keylistener =  new window.keypress.Listener();
        }

        //try{
            //configuring threejs and physijs
            if (config) {
                this.log("config loaded");
                if (this.util.physics_enabled) {
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
                        this.scene = new this.three.Scene();
                    }
                } else {
                    this.log("physics not enabled.");
                    Physijs._isLoaded = false;
                    this.scene = new this.three.Scene();
                }
            } else {
                this.log("config not loaded, switching to three.js");
                Physijs._isLoaded = false;
                this.scene = new this.three.Scene();
            }
            //setting up camera
            var cameraOptions = {
                fov : c_util.fov,
                ratio : util.ratio,
                near : c_util.near,
                far : c_util.far
            };
            if (config) {
                if (this.util.camera) {
                    cameraOptions.fov = this.util.camera.fov ? this.util.camera.fov : cameraOptions.fov;
                    cameraOptions.ratio = this.util.camera.ratio ? this.util.camera.ratio : cameraOptions.ratio;
                    cameraOptions.near = this.util.camera.near ? this.util.camera.near : cameraOptions.near;
                    cameraOptions.far = this.util.camera.far ? this.util.camera.far : cameraOptions.far;
                }
            }
            this.camera = new Camera(cameraOptions);
            var alphaRenderer = false;
            if (this.util.alpha) {
                alphaRenderer = true;
            }
            this.renderer = new this.three.WebGLRenderer({alpha:alphaRenderer, antialias: true});
            if (this.util.cast_shadow) {
                this.renderer.shadowMap.enabled = true;
                this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
                this.renderer.sortObjects = false;
            }
            //this.renderer.setClearColor(new THREE.Color('#000000'));
            this.renderer.setPixelRatio( window.devicePixelRatio );
            this.renderer.setSize( util.w , util.h );
            //document.body.appendChild( this.renderer.domElement );
            document.getElementById("gameContainer").appendChild(this.renderer.domElement);
            //handling user input
            //M.user.handleUserInput();
            //updating game
            M.game.update();
            //updating universe
            M.universe.update();

            //launch render method
            M.control.init();
            this.render();

            //we are pretty sure we can add stuff to our universe
            if (this.onCreate instanceof Function) {
                this.onCreate();
            } else {
                console.log("Something wrong in your onCreate method");
            }

        //} catch( error ) {
        //	console.error(error);
        //	console.trace();
        //}

    }

    load() {

        console.log("inside load");
        if (!(typeof this.progressAnimation == "function")) {
            this.progressAnimation = function(callback) {
                console.log("def progressAnimation");
                callback();
            }
        }
        this.progressAnimation(this.init);

    }

    sendMessage(message) {
		parent.postMessage(message, location.origin);
    }

    onMessage() {
        const origin = event.origin || event.originalEvent.origin;
        if (origin !== location.origin)
            return;

    }

    onkey(key, callback) {
        if (this._keylistener) {
            this._keylistener.simple_combo(key, callback);
        }
    }

    //utilities methods
    log() {

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

    }

    onDocumentMouseWheel(event) {

    	event.preventDefault();
    	this.zoom = event.wheelDelta * 0.05;
    	this.camera.object.position.z += this.zoom;

    }

    onDocumentMouseMove(event) {

    	this.mouseX = event.clientX - this.windowHalfX;
    	this.mouseY = event.clientY - this.windowHalfY;

    }

    onDocumentTouchStart(event) {

    	if (event.touches.length === 1) {

    		event.preventDefault();

    		this.mouseX = event.touches[ 0 ].pageX - this.windowHalfX;
    		this.mouseY = event.touches[ 0 ].pageY - this.windowHalfY;

    	}
    }

    onDocumentTouchMove(event) {

    	if (event.touches.length === 1) {

    		event.preventDefault();

    		this.mouseX = event.touches[ 0 ].pageX - this.windowHalfX;
    		this.mouseY = event.touches[ 0 ].pageY - this.windowHalfY;

    	}

    }

    //keyup event
    keyup(event) {}

    //keydown event
    keydown(event) {}

    //handling failed tests
    onFailedTest(message, test) {}

    //handling succesful tests
    onSuccededTest(message) {}

}

// retrieving M object
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    console.log(window);
    module.exports = M;

    delete window['M'];
} else {
    // we're inside our favourite browser
    window.app = {};
    M.started = false;
    M.start = function(_app) {
        if (M.started) {
            console.log('app already started');
            return;
        }
        M.started = true;
        console.log("inside window onload");
        //creating app object
        if (_app)
            app = _app;
        } else {
            app = new App();
        }

        //before starting loading stuff, be sure to pass all tests
        M.util.start();

        M.util.check.start(app.onSuccededTest, app.onFailedTest)
            .then(() => {
                app.preload(function() {
                    M.assetsManager.load(function() {
                        app.prepareScene();
                        app.load();
                    });
                });
            })
    };

    M.resize = function () {
        app.util.h 	= window.innerHeight;
        app.util.w 	= window.innerWidth;
        app.util.ratio = app.util.w/app.util.h;

        if (!app.camera || !app.renderer) return;
        app.camera.object.aspect = app.util.ratio;
        app.camera.object.updateProjectionMatrix();
        app.renderer.setSize(app.util.w, app.util.h);
    };

    //window.addEventListener('load', M.start);
    window.addEventListener('resize', M.resize);


    M.version = '0.0.46';
    M.author = {
        name: 'Marco Stagni',
        email: 'mrc.stagni@gmail.com',
        website: 'http://mage.studio'
    };
}
