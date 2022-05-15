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

        this.render = this.render.bind(this);
    }

    getName() {
        return this.name;
    }

    prepareScene() {}

    onStateChange = (state) => {};
    onCreate() {}
    onUpdate() {}

    onBeforeDispose() {}
    onDispose() {}


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

    getJSONUrl = () => null;

    loadScene = (url = this.getJSONUrl()) => {
        if (getWindow() && url) {
            return fetch(url)
                .then(res => res.json())
                .then(this.parseScene)
                .catch(() => Promise.resolve());
        }
        return Promise.resolve();
    };

    preload = (url = this.getJSONUrl()) => this.loadScene(url);

    requestNextAnimationFrame() {
        this.requestAnimationFrameId = requestNextFrame(this.render);
    }

    cancelNextAnimationFrame = () => cancelAnimationFrame(this.requestAnimationFrameId);

    render() {
        const dt = Scene.clock.getDelta();

        if (PostProcessing.isEnabled()) {
            PostProcessing.render(dt);
        } else {
            Scene.render(dt);
        }

        Particles.update(dt);
        this.onUpdate(dt);
        Scene.update(dt);
        Assets.update(dt);
        Stats.update(dt);
        Controls.update(dt);
        Input.update(dt);

        this.requestNextAnimationFrame();
    }

    init = () => {
        Scene.create(this.getName());
        Scene.createCamera(new Camera());

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
