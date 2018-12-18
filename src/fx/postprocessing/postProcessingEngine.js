import {
    WebGLRenderer
} from 'three';

import EffectComposer from './effects/EffectComposer';

import RenderPass from './effects/RenderPass';

import SceneManager from '../../base/SceneManager';
import HueSaturationEffect from './HueSaturationEffect';
import SepiaEffect from './SepiaEffect';

export class PostProcessingEngine {

    constructor() {
        this.map = {
            SepiaEffect,
            HueSaturationEffect
        };

        this.effects = [];
    }

    isEnabled() {
        return !!this.effects.length;
    }

    init = () => {
        window.addEventListener( 'resize', this.onWindowResize, false );

        this.composer = new EffectComposer(SceneManager.renderer);
        this.composer.addPass(new RenderPass(SceneManager.scene, SceneManager.camera.object));
    }

    onWindowResize = () => {
        this.composer.setSize(window.innerWidth, window.innerHeight);
    }

    get(id) {
        return this.map[id] || null;
    }

    add = (effect, options) => {
        if (effect && typeof effect === 'function') {
            const pass = effect(options);
            this.composer.addPass(pass);
            this.effects.push(pass);
        }
    }

    render = () => {
        const delta = SceneManager.clock.getDelta();
        this.composer.render(delta);
    }
}

export default new PostProcessingEngine();
