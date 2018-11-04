import {
    WebGLRenderer
} from 'three';

//import { BloomEffect, EffectComposer, EffectPass, RenderPass } from "postprocessing";
import EffectComposer from './effects/EffectComposer';

import RenderPass from './effects/RenderPass';

import {
    NodeFrame,
    NodePostProcessing
} from './nodes';

import SceneManager from '../../base/SceneManager';
import ColorAdjustement from './ColorAdjustement';
import HueSaturationEffect from './HueSaturationEffect';
import SepiaEffect from './SepiaEffect';
import MotionBlur from './MotionBlur';

export class PostProcessingEngine {

    constructor() {
        this.map = {
            ColorAdjustement,
            MotionBlur,
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
            console.log(pass);
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
