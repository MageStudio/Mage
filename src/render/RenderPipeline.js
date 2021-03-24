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
    OFFSCREEN_DISPOSE,
    OFFSCREEN_INIT,
    OFFSCREEN_PROXYCAMERA_UPDATE_EVENT,
    OFFSCREEN_REMOVE_ELEMENT,
    OFFSCREEN_RESIZE_EVENT,
    OFFSCREEN_SET_CLEARCOLOR,
    OFFSCREEN_SET_CSM,
    OFFSCREEN_SET_FOG,
    OFFSCREEN_SET_SHADOWTYPE,
    OFFSCREEN_SET_TONE_MAPPING,
    OFFSCREEN_UPDATE_POSITION,
    OFFSCREEN_UPDATE_ROTATION,
    OFFSCREEN_UPDATE_CAMERA_POSITION,
    OFFSCREEN_UPDATE_CAMERA_ROTATION
 } from "./events";
import { createOffscreenCanvas } from "../lib/dom";
import { getWindow } from "../core/window";

import Universe from "../core/Universe";
import Audio from "../audio/Audio";
import { evaluateCameraPosition } from "../lib/camera";
import { Camera } from "../entities";
import { Object3D } from "three";
class RenderPipeline {

    constructor() {
        // create worker here
        this.isOffscreenSupported = Features.isFeatureSupported(FEATURES.OFFSCREENCANVAS);

        this.flags = {
            csm: false
        };
    }

    createProxyRoot() {
        this.proxyRoot = new Object3D();
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

    createWorker() {
        this.offscreenScene = new OffscreenScene();
        this.offscreenScene.onmessage = this.onOffscreenSceneMessage;
    }

    create() {
        if (this.isUsingOffscreen()) {
            this.createWorker();
            this.createProxyCamera();
            this.createProxyRoot();

            this.canvas = createOffscreenCanvas();
            this.offscreenCanvas = this.canvas.transferControlToOffscreen();

            this.offscreenScene.postMessage({
                event: OFFSCREEN_CREATE,
                config: {
                    ...Config.getConfig()
                },
                canvas: this.offscreenCanvas
            }, [this.offscreenCanvas]);
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

    getChildren() {
        if (this.isUsingOffscreen()) {
            return this.proxyRoot.children;
        } else {
            return Scene.getChildren();
        }
    }

    getDOMElement = () => {
        if (this.isUsingOffscreen()) {
            return this.canvas;
        } else {
            return Scene.getDOMElement();
        }
    }

    getMaxAnisotropy() {
        if (this.isUsingOffscreen()) {
            return 16;
        } else {
            return Scene.getRenderer()
                .capabilities
                .getMaxAnisotropy()
        }
    }

    getCamera() {
        if (this.isUsingOffscreen()) {
            return this.proxyCamera;
        } else {
            return Scene.getCamera();
        }
    }

    getCameraBody() {
        if (this.isUsingOffscreen()) {
            return this.proxyCamera.body;
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

    isUsingCSM() {
        return this.flags.csm;
    }

    setUpCSM(options = {}) {
        if (this.isUsingOffscreen()) {
            this.offscreenScene.postMessage({
                event: OFFSCREEN_SET_CSM,
                options
            });
        } else {
            Scene.setUpCSM(options);
        }

        this.flags.csm = true;
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
            this.proxyRoot.add(body);
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

    dispatchRotationToOffscreen(uuid, { x, y, z }) {
        if (this.isUsingOffscreen()) {
            this.offscreenScene.postMessage({
                event: OFFSCREEN_UPDATE_ROTATION,
                uuid,
                rotation: { x, y, z }
            });
        }
    }

    dispatchPositionToOffscreen(uuid, { x, y, z }) {
        if (this.isUsingOffscreen()) {
            this.offscreenScene.postMessage({
                event: OFFSCREEN_UPDATE_POSITION,
                uuid,
                position: { x, y, z }
            });
        }
    };

    dispatchCameraRotationToOffscreen({ x, y, z }) {
        if (this.isUsingOffscreen()) {
            this.offscreenScene.postMessage({
                event: OFFSCREEN_UPDATE_CAMERA_ROTATION,
                rotation: { x, y, z }
            });
        }
    }

    dispatchCameraPositionToOffscreen({ x, y, z }) {
        if (this.isUsingOffscreen()) {
            this.offscreenScene.postMessage({
                event: OFFSCREEN_UPDATE_CAMERA_POSITION,
                position: { x, y, z }
            });
        }
    };

    remove(body) {
        if (this.isUsingOffscreen()) {
            this.proxyRoot.remove(body);
            this.offscreenScene.postMessage({
                event: OFFSCREEN_REMOVE_ELEMENT,
                uuid: body.uuid
            })
        } else {
            Scene.remove(body);
        }

        Universe.remove(body.name);
    }

    updateChildren() {
        if (this.isUsingOffscreen()) {
            console.error('[Mage] RenderPipeline.updateChildren is not implemented for offscreen');
        } else {
            Scene.updateChildren();
        }
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

    onProxyCameraUpdate = ({ position, quaternion, dt }) => {
        this.proxyCamera.alignBodyToOffscreen(position, quaternion);
        this.proxyCamera.update(dt);
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

    render = (dt) => {
        if (this.isUsingOffscreen()) {
            this.getCamera().update(dt);
        } else {
            Scene.render(dt);
            this.onAudioListenerUpdate(evaluateCameraPosition(Scene.getCameraBody()));
        }

        Universe.update(dt);
    }

    dispose() {
        if (this.isUsingOffscreen()) {
            this.offscreenScene.postMessage({
                event: OFFSCREEN_DISPOSE
            });
        } else {
            Scene.dispose();
        }
    }

    onPhysicsUpdate = (dt) => {
        Universe.onPhysicsUpdate(dt);

        if (this.isUsingOffscreen()) {
            this.getCamera()
                .onPhysicsUpdate(dt);
        } else {
            Scene.getCamera()
                .onPhysicsUpdate(dt);
        }
    }
}

export default new RenderPipeline();