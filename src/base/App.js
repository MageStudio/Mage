import AssetsManager from './AssetsManager';
import Universe from './Universe';
import SceneManager from './SceneManager';
import SceneHelper from './SceneHelper';
import util from './util';
import Config from './config';
import MeshLoader from '../loaders/MeshLoader';
import LightLoader from '../loaders/LightLoader';
import PostProcessingEngine from '../fx/postprocessing/PostProcessingEngine';
import Input from './input/Input';
import LightEngine from '../lights/LightEngine';

import { renderUI } from '../ui/render';

import Vivus from 'vivus';

import {
    Scene,
    EventDispatcher
} from 'three';

import { fetch } from 'whatwg-fetch';
import { getWindow } from './window';

export const author = {
    name: 'Marco Stagni',
    email: 'mrc.stagni@gmail.com',
    website: 'http://mage.studio'
};

export class App extends EventDispatcher {

    constructor(config, container) {
        super();

        this.name = this.constructor.name;

        const win = getWindow();
        this.debug = true;

        this.sceneHelper = new SceneHelper();

        SceneManager.create();

        if (win) {
            this.windowHalfX = win.innerWidth / 2;
            this.windowHalfY = win.innerHeight / 2;
            win.addEventListener('resize', this.onResize);
        }
    }

    enableInput = () => {
        Input.enable();
        Input.addEventListener('keyPress', this.onKeyPress.bind(this));
        Input.addEventListener('keyDown', this.onKeyDown.bind(this));
        Input.addEventListener('keyUp', this.onKeyUp.bind(this));
        Input.addEventListener('mouseDown', this.onMouseDown.bind(this));
        Input.addEventListener('mouseUp', this.onMouseUp.bind(this));
        Input.addEventListener('mouseMove', this.onMouseMove.bind(this));
        Input.addEventListener('meshClick', this.onMeshClick.bind(this));
        Input.addEventListener('meshDeselect', this.onMeshDeselect.bind(this));
    }

    disableInput = () => {
        Input.disable();
        Input.removeEventListener('keyPress', this.onKeyPress);
        Input.removeEventListener('keyDown', this.onKeyDown);
        Input.removeEventListener('keyUp', this.onKeyUp);
        Input.removeEventListener('mouseDown', this.onMouseDown);
        Input.removeEventListener('mouseUp', this.onMouseUp);
        Input.removeEventListener('mouseMove', this.onMouseMove);
        Input.removeEventListener('meshClick', this.onMeshClick);
        Input.removeEventListener('meshDeselect', this.onMeshDeselect);
    }

    onKeyPress = () => {}
    onKeyDown = () => {}
    onKeyUp = () => {}
    onMouseDown = () => {}
    onMouseUp = () => {}
    onMouseMove = () => {}
    onMeshClick = () => {}
    onMeshDeselect = () => {}

    enableUI = (RootComponent, _options) => {
        const options = {
            scene: this
        };
        renderUI(RootComponent, options);
    }

    onCreate() {}
    prepareScene() {}
    onUpdate() {}
    onFailedTest(message, test) {}
    onSuccededTest(message) {}

    parseScene = ({ meshes = [], models = [], lights = [] }, options = {}) => {
        return new Promise((resolve, reject) => {
            if (meshes.length) {
                for (var i in models) {
                    meshes.push(models[i]);
                }
                MeshLoader.load(meshes, options);
            }

            if (lights.length) {
                LightLoader.load(lights, options);
            }

            SceneManager.updateChildren();

            resolve();
        })
    }

    getJSONUrl = () => `assets/scenes/${this.name}.json`;

    loadScene = (url = this.getJSONUrl()) => {
        if (getWindow()) {
            return fetch(url)
                .then(res => res.json())
                .then(this.parseScene)
                .catch(() => Promise.resolve());
        }
        return Promise.resolve();
    }

    preload = (url = this.getJSONUrl()) => this.loadScene(url);

    onResize = () => SceneManager.onResize();

    render = () => {
        SceneManager.render();
        PostProcessingEngine.render();
        this.onUpdate();
        SceneManager.update();
        AssetsManager.update();

        requestAnimFrame(this.render.bind(this));
    }

    init = () => {
        const win = getWindow();

        PostProcessingEngine.init();

        this.render();

        if (this.onCreate instanceof Function) {
            console.log('calling oncreate');
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

    toJSON() {
        // export everything that is inside Universe
        // and LightEngine
        return {
            ...LightEngine.toJSON(),
            ...Universe.toJSON()
        };
    }

}

export default App;
