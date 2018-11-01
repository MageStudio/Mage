import {
    WebGLRenderer
} from 'three';

import { BloomEffect, EffectComposer, EffectPass, RenderPass } from "postprocessing";


import {
    NodeFrame,
    NodePostProcessing
} from './nodes';

import SceneManager from '../../base/SceneManager';
import ColorAdjustement from './ColorAdjustement';
import MotionBlur from './MotionBlur';

export class PostProcessingEngine {

    constructor() {
        this.map = {
            ColorAdjustement,
            MotionBlur
        };
        this.frame = new NodeFrame();

        //this.composer = new EffectComposer(new WebGLRenderer());
        //this.composer.addPass(new RenderPass(SceneManager.scene, SceneManager.camera));

    }

    init = () => {
        window.addEventListener( 'resize', this.onWindowResize, false );

        this.nodepost = new NodePostProcessing(SceneManager.renderer);
    }

    onWindowResize = () => {
        this.nodepost.setSize(window.innerWidth, window.innerHeight);
    }

    get(id) {
        return this.map[id] || null;
    }

    add = (effect, options) => {
        this.nodepost.output = effect(options);
        this.nodepost.needsUpdate = true;


        /*
        const effect = new effectConstructor();
        const effectPass = new EffectPass(SceneManager.camera, effect);
        effectPass.renderToScreen = true;

        this.composer.addPass(effectPass);

        */
    }

    update = () => {
        const delta = SceneManager.clock.getDelta();
        // multiple post processing elements
        // each one acting on the nodePost = new THREE.NodePostProcessing(renderer);
        this.frame.update(delta);
		this.nodepost.render(
            SceneManager.scene,
            SceneManager.camera.object,
            this.frame
        );
        //this.composer.render(delta);
    }
}

export default new PostProcessingEngine();
