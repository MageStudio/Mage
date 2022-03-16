import Assets from './Assets';
import Universe from './Universe';
import Scene from './Scene';
import Stats from './Stats';
import Audio from '../audio/Audio';
import MeshLoader from '../loaders/MeshLoader';
import LightLoader from '../loaders/LightLoader';
import PostProcessing from '../fx/postprocessing/PostProcessing';
import Particles from '../fx/particles/Particles';
import Input, { INPUT_EVENTS_LIST } from './input/Input';
import Lights from '../lights/Lights';
import Controls from '../controls/Controls';
import Physics from '../physics';
import {
    EventDispatcher
} from 'three';
import { fetch } from 'whatwg-fetch';
import { getWindow } from './window';
import { upperCaseFirst } from '../lib/strings';
import { ONCREATE_NOT_AVAILABLE } from '../lib/messages';
import Camera from '../entities/camera';

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

    enableInput = () => {
        Input.enable();
        if (!this.inputListenersAreSet) {
            INPUT_EVENTS_LIST.forEach((event) => {
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
        INPUT_EVENTS_LIST.forEach((event) => {
            const methodName = `on${upperCaseFirst(event)}`;
            if (typeof this[methodName] === 'function') {
                Input.removeEventListener(event, this[methodName]);
            }
        });
        this.inputListenersAreSet = false;
        this.onInputDisabled();
    };

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

        Scene.render(dt);
        Particles.update(dt);
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
        const {
            path
        } = this.options;

        Scene.create(path);
        Scene.createCamera(new Camera());
        this.enableInput();

        Physics
            .init()
            .then(() => {
                Particles.init();
                PostProcessing.init();
                Stats.init();

                this.render();

                if (this.onCreate instanceof Function) {
                    this.onCreate();
                } else {
                    console.log(ONCREATE_NOT_AVAILABLE);
                }
            })
    };

    dispose = () => {
        this.onBeforeDispose();

        this.disableInput();

        Physics.dispose();
        Audio.dispose();
        Particles.dispose();
        PostProcessing.dispose();
        Universe.bigfreeze();
        Scene.dispose();
        Controls.dispose();
        this.cancelNextAnimationFrame();

        this.onDispose();
    };

    toJSON() {
        return {
            ...Lights.toJSON(),
            ...Universe.toJSON()
        };
    }

}

export default Level;
