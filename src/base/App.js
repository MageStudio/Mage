import Manager from './Manager';
import Universe from './Universe';
import Camera from '../entities/Camera';
import util from './util';
import {
    Clock,
    Scene,
    WebGLRenderer,
    PCFSoftShadowMap
} from 'three';

export const version = '0.0.83';
export const author = {
    name: 'Marco Stagni',
    email: 'mrc.stagni@gmail.com',
    website: 'http://mage.studio'
};

export class App {

    constructor() {

        this.log_types = {
    		"e" : "error",
    		"w" : "warn",
    		"i" : "info"
    	};

        //util
        const DEFAULT_HEIGHT = 600;
        const DEFAULT_WIDTH = 800;
        const DEFAULT_RATIO = DEFAULT_WIDTH / DEFAULT_HEIGHT;

        this.config = Object.assign({
    		h : window ? window.innerHeight : DEFAULT_HEIGHT,
    		w : window ? window.innerWidth : DEFAULT_WIDTH,
    		ratio : window ? (window.innerWidth/window.innerHeight) : DEFAULT_RATIO,
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

    	//debug mode
        this.debug = true;

        //CLOCK!
        this.clock = new Clock();

        //window and mouse variables
        this.mouseX = 0;
        this.mouseY = 0;
        this.zoom = 0;

        this.windowHalfX = window.innerWidth / 2;
        this.windowHalfY = window.innerHeight / 2;
        this.CAMERA_MAX_Z = 1000;
        this.CAMERA_MIN_Z = 250;

        // creating manager
        this.manager = new Manager();
        this.universe = new Universe();

        // registering listener for events from parent
        window.addEventListener("onmessage", this.onMessage, false);
        window.addEventListener("message", this.onMessage, false);
        //window.addEventListener('load', M.start);
        window.addEventListener('resize', this.onResize);


    }

    set clearColor(value) {
        try {
            if (this.renderer) {
                this.renderer.setClearColor(value);
                //this.clearColor = value;
            }
        } catch (e) {}
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
        if ($) {
            $('#loader').animate({"opacity" : "0", "margin-top" : "250px"}, 1000 , function () {
                $('#loader').remove();
                $('body').animate({backgroundColor : "#fff"}, 200 , callback);
            });
        } else {
            callback();
        }

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

    // window Resized
    onResize() {
        this.config.h = window.innerHeight;
        this.config.w = window.innerWidth;
        this.config.ratio = this.config.w / this.config.h;

        if (!this.camera || !this.renderer) return;

        this.camera.object.aspect = this.config.ratio;
        this.camera.object.updateProjectionMatrix();
        this.renderer.setSize(this.config.w, this.config.h);
    };

    render() {

        //handling user input
        //M.user.handleUserInput();
        //updating game and engines
        // M.game.update();
        // M.audioEngine.update();
        // M.lightEngine.update();
        this.engine.update();
        //updating universe
        this.universe.update(this.clock.getDelta()));
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
        if (this.config.physics_enabled && Physijs._isLoaded) {
            this.scene.simulate();
        }
        if (this.config.tween_enabled) {
            TWEEN.update();
        }
        requestAnimFrame(this.render.bind(this));

    }

    add(mesh, element) {
		this.scene.add(mesh);
		this.universe.set(mesh.uuid, element);
	}

	remove(mesh) {
		this.scene.remove(mesh);
		this.universe.remove(mesh.uuid);
	}

    createScene() {
        const { physics_enabled = false } = this.config;
        const ammo = 'ammo.js';
        const worker = 'workers/physijs_worker.js';

        if (physics_enabled && Physijs) {
            Physijs.scripts.worker = worker;
            Physijs.scripts.ammo = ammo;
            this.scene = new Physijs.Scene();
            Physijs._isLoaded = true;
        } else {
            Physijs._isLoaded = false;
            this.scene = new Scene();
        }
    }

    createCamera() {
        const cameraOptions = {
            fov : this.config.camera.fov,
            ratio : this.config.ratio,
            near : this.config.camera.near,
            far : this.config.camera.far
        };

        this.camera = new Camera(cameraOptions);
    }

    createRenderer() {
        const alphaRenderer = !!this.config.alpha;

        this.renderer = new WebGLRenderer({alpha: alphaRenderer, antialias: true});

        if (this.config.cast_shadow) {
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = PCFSoftShadowMap;
            this.renderer.sortObjects = false;
        }

        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( this.config.w , this.config.h );

        document.getElementById("gameContainer").appendChild(this.renderer.domElement);
    }

    init() {
        if (window && window.keypress) {
            this._keylistener =  new window.keypress.Listener();
        }

        this.createScene();
        this.createCamera();
        this.createRenderer();

        //handling user input
        //M.user.handleUserInput();
        //updating game
        M.game.update();
        //updating universe
        this.universe.update();

        //launch render method
        M.control.init();
        this.render();

        //we are pretty sure we can add stuff to our universe
        if (this.onCreate instanceof Function) {
            this.onCreate();
        } else {
            console.log("Something wrong in your onCreate method");
        }
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

export default App;

export const start(className) {
    if (typeof className === 'function') {
        window.app = new className();
    }

    util.start();
    util.checker.start(
        app.onSuccededTest,
        app.onFailedTest
    ).then(app.preload(() => {
        app.manager
            .load()
            .then(() => {
                app.prepareScene();
                app.load();
            })
    }))
}
