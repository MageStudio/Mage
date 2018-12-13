import Manager from './Manager';
import Universe from './Universe';
import SceneManager from './SceneManager';
import Camera from '../entities/Camera';
import util from './util';
import Config from './config';
import MeshLoader from '../loaders/MeshLoader';
import LightLoader from '../loaders/LightLoader';
import PostProcessingEngine from '../fx/postprocessing/PostProcessingEngine';

import Vivus from 'vivus';

import {
    Clock,
    Scene,
    WebGLRenderer,
    PCFSoftShadowMap
} from 'three';
import { fetch } from 'whatwg-fetch';
import { getWindow } from './window';

export const version = '0.0.83';
export const author = {
    name: 'Marco Stagni',
    email: 'mrc.stagni@gmail.com',
    website: 'http://mage.studio'
};

export class App {

    constructor(config, assets) {

        const win = getWindow();

        this.log_types = {
    		"e" : "error",
    		"w" : "warn",
    		"i" : "info"
    	};

        Config.setConfig(config);

        this.assets = assets;

    	//scnee parameters
        this.user = undefined;
        this.clearColor = 0x000000;

    	//debug mode
        this.debug = true;

        //window and mouse variables
        this.mouseX = 0;
        this.mouseY = 0;
        this.zoom = 0;

        this.CAMERA_MAX_Z = 1000;
        this.CAMERA_MIN_Z = 250;

        // creating manager
        this.manager = new Manager();
        SceneManager.setAssets(this.assets);

        // registering listener for events from parent
        if (win) {
            this.windowHalfX = win.innerWidth / 2;
            this.windowHalfY = win.innerHeight / 2;
            win.addEventListener("onmessage", this.onMessage, false);
            win.addEventListener("message", this.onMessage, false);
            win.addEventListener('resize', this.onResize);
        }
    }

    setClearColor(value) {
        SceneManager.setClearColor(value);
    }

    //onCreate method, ovveride to start creating stuff
    onCreate() { }

    parseScene = ({ meshes = [], models = [], lights = [] }) => {
        return new Promise((resolve, reject) => {
            if (meshes.length) {
                for (var i in models) {
                    meshes.push(models[i]);
                }
                MeshLoader.load(meshes);
            }

            if (lights.length) {
                LightLoader.load(lights);
            }

            SceneManager.updateChildren();

            resolve();
        })
    }

    loadScene = () => {
        if (getWindow()) {
            return fetch('scene.json')
                .then(res => res.json())
                .then(this.parseScene)
                .catch(Promise.resolve);
        }
        return Promise.resolve();
    }

    //this methods helps you loading heavy stuff
    preload = () => {
        return this.loadScene();
    }

    //do stuff before onCreate method( prepare meshes, whatever )
    prepareScene() {}

    //needed if user wants to add a customRender method
    _render() {}

    // window Resized
    onResize = () => {
        SceneManager.onResize();
    };

    render = () => {
        SceneManager.render();
        PostProcessingEngine.render();

        this._render();
        SceneManager.update();
        this.manager.update();


        requestAnimFrame(this.render.bind(this));

    }

    init = () => {
        const win = getWindow();
        if (win && win.keypress) {
            this._keylistener = new win.keypress.Listener();
        }

        SceneManager.create();
        PostProcessingEngine.init();
        // M.control.init();
        this.render();

        if (this.onCreate instanceof Function) {
            this.onCreate();
        } else {
            console.log("[Mage] Something wrong in your onCreate method");
        }
    }

    load = () => {
        if (!(typeof this.progressAnimation == "function")) {
            this.progressAnimation = (callback) => {
        		new Vivus("mage", {
                    type: 'oneByOne',
                    duration: 1000,
                    onReady: function() {
            			document.getElementById('mage').classList.add('visible');
            		}
                });
                setTimeout(() => {
                    document.getElementById('loader').classList.add('fadeout');
                }, 5000)
                setTimeout(() => {
                    document.getElementById('loader').classList.add('invisible');
                }, 6000);
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
    	SceneManager.camera.object.position.z += this.zoom;
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

export const start = (className, config, assets) => {
    let app;
    if (typeof className === 'function') {
        app = new className(config, assets);
    } else {
        app = new App(config, assets);
    }

    util.start();
    util.checker.check(
        app.onSuccededTest,
        app.onFailedTest
    ).then(() => {
        app.preload()
            .then(() => {
                app.manager
                    .load()
                    .then(() => {
                        app.prepareScene();
                        app.load();
                    })
                })
        }
    );

    return app;
}
