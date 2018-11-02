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
        //this.frame = new NodeFrame();


    }

    isEnabled() {
        return !!this.effects.length;
    }

    init = () => {
        window.addEventListener( 'resize', this.onWindowResize, false );

        this.composer = new EffectComposer(SceneManager.renderer);
        this.composer.addPass(new RenderPass(SceneManager.scene, SceneManager.camera.object));


        //this.nodepost = new NodePostProcessing(SceneManager.renderer);
    }

    onWindowResize = () => {
        //this.nodepost.setSize(window.innerWidth, window.innerHeight);
    }

    get(id) {
        return this.map[id] || null;
    }

    add = (effect, options) => {
        //this.nodepost.output = effect(options);
        //this.nodepost.needsUpdate = true;


        /*
        const effect = new effectConstructor();
        const effectPass = new EffectPass(SceneManager.camera, effect);
        effectPass.renderToScreen = true;

        this.composer.addPass(effectPass);

        */

        if (effect && typeof effect === 'function') {
            const pass = effect(options);
            console.log(pass);
            this.composer.addPass(pass);
            this.effects.push(pass);
        }
    }

    render = () => {
        const delta = SceneManager.clock.getDelta();
        // multiple post processing elements
        // each one acting on the nodePost = new THREE.NodePostProcessing(renderer);
        //this.frame.update(delta);

        /*this.nodepost.render(
            SceneManager.scene,
            SceneManager.camera.object,
            this.frame
        );*/
        this.composer.render(delta);
    }
}

export default new PostProcessingEngine();
