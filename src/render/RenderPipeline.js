import Config from "../core/config";
import Scene from './Scene';
import OffscreenScene from 'worker:./OffscreenScene';
import Features, { FEATURES } from "../lib/features";
import { OFFSCREEN_INIT } from "./events";

class RenderPipeline {

    constructor() {
        // create worker here
        this.offscreenScene = new OffscreenScene();
        this.isOffscreenSupported = Features.isFeatureSupported(FEATURES.OFFSCREENCANVAS);

        this.offscreenScene.onmessage = this.handleOffscreenSceneMessage;
    }

    isUsingOffscreen() {
        const { offscreen } = Config.beta();

        return offscreen && this.isOffscreenSupported;
    }

    init() {
        if (this.isUsingOffscreen()) {
            this.offscreenScene.postMessage({
                event: OFFSCREEN_INIT,
                config: {
                    ...Config.getConfig()
                }
            })
        }
    }

    addPostProcessingEffect() {
        // handle post processing here and sending message to Scene
    }

    handleOffscreenSceneMessage = () => {
        // handling
    };

    render() {
        // only render Scene if we're not using offscreen
        if (!this.isUsingOffscreen()) {
            Scene.render();
        }
    }
}

export default new RenderPipeline();