import {
    NodeFrame,
    NodePostProcessing
} from 'three';

import SceneManager from '../../base/SceneManager';

export class PostProcessingEngine {

    constructor() {
        this.frame = new NodeFrame();
        this.nodepost = new NodePostProcessing(SceneManager.renderer);
    }

    update() {
        // multiple post processing elements
        // each one acting on the nodePost = new THREE.NodePostProcessing(renderer);
        frame.update(delta);
		nodepost.render(
            SceneManager.scene,
            SceneManager.camera,
            this.frame
        );
    }
}

export default new PostProcessingEngine();
