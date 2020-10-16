import Assets from './Assets';
import Universe from './Universe';
import Scene from './Scene';
import Stats from './Stats';
import MeshLoader from '../loaders/MeshLoader';
import LightLoader from '../loaders/LightLoader';
import PostProcessing from '../fx/postprocessing/PostProcessing';
import Input, { INPUT_EVENTS } from './input/Input';
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

export class Level extends EventDispatcher {

    constructor(options) {
        super();

        this.options = options;
        this.name = this.constructor.name;
        this.debug = true;
        this.inputListenersAreSet = false;

        Scene.create();
        this.enableInput();
    }

    prepareScene() {}

    onStateChange = (state) => {};
    onCreate() {}
    onUpdate() {}
    onFailedTest(message, test) {}
    onSuccededTest(message) {}
    onBeforeDispose() {}
    onDispose() {}
    
    onInputEnabled() {}
    onInputDisabled() {}

    onUiEnabled() {}
    onUiDisabled() {}

    enableInput = () => {
        Input.enable();
        if (!this.inputListenersAreSet) {
            INPUT_EVENTS.forEach((event) => {
                const methodName = `on${upperCaseFirst(event)}`;
                if (typeof this[methodName] === 'function') {
                    Input.addEventListener(event, this[methodName].bind(this));
                }
            });
            this.inputListenersAreSet = true;
            this.onInputEnabled();
        }
    };

    disableInput = () => {
        Input.disable();
        INPUT_EVENTS.forEach((event) => {
            const methodName = `on${upperCaseFirst(event)}`;
            if (typeof this[methodName] === 'function') {
                Input.removeEventListener(event, this[methodName]);
            }
        });
        this.inputListenersAreSet = false;
        this.onInputDisabled();
    };


    enableUI = (RootComponent, _props) => {
        const props = {
            level: this,
            ..._props
        };
        mount(RootComponent, props);

        this.onUiEnabled();
    };

    disableUI = () => {
        unmount();
        this.onUiDisabled();
    }

    parseScene = ({ elements = [], models = [], lights = [] }, options = {}) => {
        return new Promise((resolve, reject) => {
            if (elements.length) {
                for (let i in models) {
                    elements.push(models[i]);
                }
                MeshLoader.load(elements, options);
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

    requestNextAnimationFrame = () => {
        this.requestAnimationFrameId = requestNextFrame(this.render.bind(this));
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
        this.onBeforeDispose();

        this.disableInput();
        Physics.dispose();
        this.disableUI();
        Universe.bigfreeze();
        Scene.dispose();
        Controls.dispose();
        this.cancelNextAnimationFrame();

        this.onDispose();
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

export default Level;
