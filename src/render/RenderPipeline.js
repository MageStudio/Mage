import Config from "../core/config";
import Scene from './Scene';
import OffscreenScene from 'worker:./OffscreenScene';
import Features, { FEATURES } from "../lib/features";
import {
    OFFSCREEN_ADD_ELEMENT,
    OFFSCREEN_ADD_PARTICLES,
    OFFSCREEN_ADD_POSTPROCESSING,
    OFFSCREEN_AUDIO_LISTENER_UPDATE_EVENT,
    OFFSCREEN_CREATE,
    OFFSCREEN_INIT,
    OFFSCREEN_PROXYCAMERA_UPDATE_EVENT,
    OFFSCREEN_RESIZE_EVENT,
    OFFSCREEN_SET_CLEARCOLOR,
    OFFSCREEN_SET_FOG,
    OFFSCREEN_SET_SHADOWTYPE,
    OFFSCREEN_SET_TONE_MAPPING,
    OFFSCREEN_UPDATE_POSITION,
    OFFSCREEN_UPDATE_ROTATION
 } from "./events";
import { createOffscreenCanvas } from "../lib/dom";
import { getWindow } from "../core/window";

import Universe from "../core/Universe";
import Audio from "../audio/Audio";
import { evaluateCameraPosition } from "../lib/camera";
import { Camera } from "../entities";
class RenderPipeline {

    constructor() {
        // create worker here
        this.offscreenScene = new OffscreenScene();
        this.isOffscreenSupported = Features.isFeatureSupported(FEATURES.OFFSCREENCANVAS);

        this.offscreenScene.onmessage = this.onOffscreenSceneMessage;

        this.createProxyCamera();
    }

    createProxyCamera() {
        const { ratio } = Config.screen();
        const { fov, near, far } = Config.camera();

        this.proxyCamera = new Camera({
            fov,
            ratio,
            near,
            far
        });
    }

    isUsingOffscreen() {
        const { offscreen } = Config.beta();

        return offscreen && this.isOffscreenSupported;
    }

    create() {
        if (this.isUsingOffscreen()) {
            this.canvas = createOffscreenCanvas();
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

    getDOMElement = () => {
        if (this.isUsingOffscreen()) {
            return this.canvas;
        } else {
            return Scene.getDOMElement();
        }
    }

    getCameraBody() {
        if (this.isUsingOffscreen()) {
            return this.proxyCamera;
        } else {
            return Scene.getCameraBody();
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
            console.error('[Mage] offscreen.setBackground not implemented');
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

    dispatchRotationToOffscreen(uuid, rotation) {
        this.offscreenScene.postMessage({
            event: OFFSCREEN_UPDATE_ROTATION,
            uuid,
            rotation
        });
    }

    dispatchPositionToOffscreen(uuid, position) {
        this.offscreenScene.postMessage({
            event: OFFSCREEN_UPDATE_POSITION,
            uuid,
            position
        });
    };

    remove(body) {
        if (this.isUsingOffscreen()) {
            // not sure how to remove by UUID
            console.error('[Mage] offscreen.remove not implemented');
        } else {
            Scene.remove(body);
        }

        Universe.remove(body.name);
    }

    onOffscreenSceneMessage =({ data }) => {
        const { event } = data;

        switch(event) {
            case OFFSCREEN_AUDIO_LISTENER_UPDATE_EVENT:
                this.onAudioListenerUpdate(data);
                break;
            case OFFSCREEN_PROXYCAMERA_UPDATE_EVENT:
                this.onProxyCameraUpdate(data);
                break;
        }
    }

    onAudioListenerUpdate = ({ position, orientation, up }) => {
        Audio.updateListener(position, orientation, up);
    }

    onProxyCameraUpdate = ({ position, quaternion }) => {
        this.proxyCamera.alignBodyToOffscreen(position, quaternion);
    }

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
            this.onAudioListenerUpdate(evaluateCameraPosition(Scene.getCameraBody()));
        }
    }
}

export default new RenderPipeline();