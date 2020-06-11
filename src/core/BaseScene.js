import Assets from './Assets';
import Universe from './Universe';
import Scene from './Scene';
import Stats from './Stats';
import MeshLoader from '../loaders/MeshLoader';
import LightLoader from '../loaders/LightLoader';
import PostProcessing from '../fx/postprocessing/PostProcessing';
import Input, { EVENTS } from './input/Input';
import Lights from '../lights/Lights';
import Controls from '../controls/Controls';
import Physics from '../physics/physics';
import { mount, unmount } from '../ui/render';
import {
    EventDispatcher
} from 'three';
import { fetch } from 'whatwg-fetch';
import { getWindow } from './window';
import { upperCaseFirst } from '../lib/strings';
import { ONCREATE_NOT_AVAILABLE } from '../lib/messages';

export const author = {
    name: 'Marco Stagni',
    email: 'mrc.stagni@gmail.com',
    website: 'http://mage.studio'
};

export class BaseScene extends EventDispatcher {

    constructor(options) {
        super();

        this.options = options;
        this.name = this.constructor.name;
        this.debug = true;
        this.inputListenersAreSet = false;

        Scene.create();
        this.enableInput();
    }

    enableInput = () => {
        Input.enable();
        if (!this.inputListenersAreSet) {
            EVENTS.forEach((event) => {
                const methodName = `on${upperCaseFirst(event)}`;
                if (typeof this[methodName] === 'function') {
                    Input.addEventListener(event, this[methodName].bind(this));
                }
            });
            this.inputListenersAreSet = true;
        }
    };

    disableInput = () => {
        Input.disable();
        EVENTS.forEach((event) => {
            const methodName = `on${upperCaseFirst(event)}`;
            if (typeof this[methodName] === 'function') {
                Input.removeEventListener(event, this[methodName]);
            }
        });
        this.inputListenersAreSet = false;
    };

    onStateChange = (state) => {};

    enableUI = (RootComponent, _props) => {
        const props = {
            scene: this,
            ..._props
        };
        mount(RootComponent, props);
    };

    disableUI = () => unmount();

    onCreate() {}
    prepareScene() {}
    onUpdate() {}
    onFailedTest(message, test) {}
    onSuccededTest(message) {}

    parseScene = ({ meshes = [], models = [], lights = [] }, options = {}) => {
        return new Promise((resolve, reject) => {
            if (meshes.length) {
                for (let i in models) {
                    meshes.push(models[i]);
                }
                MeshLoader.load(meshes, options);
            }

            if (lights.length) {
                LightLoader.load(lights, options);
            }

            Scene.updateChildren();

            resolve();
        })
    };

    getJSONUrl = () => `assets/scenes/${this.name}.json`;

    loadScene = (url = this.getJSONUrl()) => {
        if (getWindow()) {
            return fetch(url)
                .then(res => res.json())
                .then(this.parseScene)
                .catch(() => Promise.resolve());
        }
        return Promise.resolve();
    };

    preload = (url = this.getJSONUrl()) => this.loadScene(url);

    onResize = () => Scene.onResize();

    requestNextAnimationFrame = () => {
        this.requestAnimationFrameId = requestAnimFrame(this.render.bind(this));
    }

    cancelNextAnimationFrame = () => {
        cancelAnimationFrame(this.requestAnimationFrameId);
    }

    render = () => {
        const dt = Scene.clock.getDelta();

        Physics.update();
        Scene.render(dt);
        PostProcessing.render(dt);
        this.onUpdate(dt);
        Scene.update(dt);
        Assets.update(dt);
        Stats.update(dt);
        Controls.update(dt);
        Input.update(dt);

        this.requestNextAnimationFrame();
    }

    init = () => {
        Physics.init();
        PostProcessing.init();
        Stats.init();

        this.render();

        if (this.onCreate instanceof Function) {
            this.onCreate();
        } else {
            console.log(ONCREATE_NOT_AVAILABLE);
        }
    };

    dispose = () => {
        this.disableInput();
        Physics.dispose();
        this.disableUI();
        Universe.bigfreeze();
        Scene.dispose();
        Controls.dispose();
        this.cancelNextAnimationFrame();
    };

    load = () => {
        if (!(typeof this.progressAnimation == "function")) {
            this.progressAnimation = (callback) => callback();
        }
        this.progressAnimation(this.init);
    };

    toJSON() {
        return {
            ...Lights.toJSON(),
            ...Universe.toJSON()
        };
    }

}

export default BaseScene;
