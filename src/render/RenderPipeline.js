import Config from "../core/config";
import Scene from './Scene';
import OffscreenScene from 'worker:./OffscreenScene';
import Features, { FEATURES } from "../lib/features";
import {
    OFFSCREEN_ADD_ELEMENT,
    OFFSCREEN_ADD_PARTICLES,
    OFFSCREEN_ADD_POSTPROCESSING,
    OFFSCREEN_CREATE,
    OFFSCREEN_INIT,
    OFFSCREEN_RESIZE_EVENT,
    OFFSCREEN_SET_CLEARCOLOR,
    OFFSCREEN_SET_FOG,
    OFFSCREEN_SET_SHADOWTYPE,
    OFFSCREEN_SET_TONE_MAPPING
 } from "./events";
import { createOffscreenCanvas } from "../lib/dom";
import { Clock } from "three";
import { getWindow } from "../core/window";

import Universe from "../core/Universe";
class RenderPipeline {

    constructor() {
        this.clock = new Clock();
        // create worker here
        this.offscreenScene = new OffscreenScene();
        this.isOffscreenSupported = Features.isFeatureSupported(FEATURES.OFFSCREENCANVAS);

        this.offscreenScene.onmessage = this.onOffscreenSceneMessage;
    }

    isUsingOffscreen() {
        const { offscreen } = Config.beta();

        return offscreen && this.isOffscreenSupported;
    }

    create() {
        if (this.isUsingOffscreen()) {
            const canvas = createOffscreenCanvas();
            this.offscreenScene.postMessage({
                event: OFFSCREEN_CREATE,
                config: {
                    ...Config.getConfig()
                },
                canvas
            }, [canvas]);
        } else {
            Scene.create();
        }

        this.listenToResizeEvent();
    }

    init() {
        if (this.isUsingOffscreen()) {
            this.offscreenScene.postMessage({ event: OFFSCREEN_INIT });
        } else {
            Scene.init();
        }
    }

    listenToResizeEvent() {
        const win = getWindow();
        if (win) {
            win.addEventListener('resize', this.onResize);
        }
    }

    setClearColor(color) {
        if (this.isUsingOffscreen()) {
            this.offscreenScene.postMessage({
                event: OFFSCREEN_SET_CLEARCOLOR,
                color
            });
        } else {
            Scene.setClearColor(color);
        }
    }

    setShadowType(shadowType) {
        if (this.isUsingOffscreen()) {
            this.offscreenScene.postMessage({
                event: OFFSCREEN_SET_SHADOWTYPE,
                shadowType
            });
        } else {
            Scene.setShadowType(shadowType);
        }
    }

    setBackground = texture => {
        const background = typeof texture === 'string' ? Images.get(texture) : texture;

        if (this.isUsingOffscreen()) {
            // how do we pass the texture to the worker?
        } else {
            Scene.setBackground(background);
        }
    }

    setRendererToneMapping(toneMapping, toneMappingExposure) {
        if (this.isUsingOffscreen()) {
            this.offscreenScene.postMessage({
                event: OFFSCREEN_SET_TONE_MAPPING,
                toneMapping,
                toneMappingExposure
            });
        } else {
            Scene.setRendererToneMapping(toneMapping, toneMappingExposure);
        }
    }

    setFog(color, density) {
        if (this.isUsingOffscreen()) {
            this.offscreenScene.postMessage({
                event: OFFSCREEN_SET_FOG,
                color,
                density
            });
        } else {
            Scene.setFog(color, density);
        }
    }

    addPostProcessingEffect(effect, options) {
        if (this.isUsingOffscreen()) {
            this.offscreenScene.postMessage({
                event: OFFSCREEN_ADD_POSTPROCESSING,
                effect,
                options
            });
        } else {
            Scene.addPostProcessingEffect(effect, options);
        }
    }

    addParticleEmitter(emitterId, options) {
        if (this.isUsingOffscreen()) {
            this.offscreenScene.postMessage({
                event: OFFSCREEN_ADD_PARTICLES,
                emitterId,
                options
            });
        } else {
            Scene.addParticleEmitter(emitterId, options);
        }
    }

    add(body, element, addUniverse = true) {
        if (this.isUsingOffscreen()) {
            const json = body.toJSON();

            this.offscreenScene.postMessage({
                event: OFFSCREEN_ADD_ELEMENT,
                json
            });
        } else {
            Scene.add(body);
        }

        if (addUniverse) {
            Universe.set(element.getName(), element);
            Universe.storeUUIDToElementNameReference(body.uuid, element.getName());
        }
    }

    remove(body) {
        if (this.isUsingOffscreen()) {
            // not sure how to remove by UUID
        } else {
            Scene.remove(body);
        }

        Universe.remove(body.name);
    }

    onOffscreenSceneMessage = () => {
        // handling
    };

    onResize = () => {
        if (this.isUsingOffscreen()) {
            const { h, w, ratio, devicePixelRatio } = Config.screen();

            this.offscreenScene.postMessage({
                event: OFFSCREEN_RESIZE_EVENT,
                height: h,
                width: w,
                ratio,
                devicePixelRatio
            });
        } else {
            Scene.onResize(h, w, ratio, devicePixelRatio);
        }
    }

    render(dt) {
        // only render Scene if we're not using offscreen
        if (!this.isUsingOffscreen()) {
            Scene.render(dt);
        }
    }
}

export default new RenderPipeline();