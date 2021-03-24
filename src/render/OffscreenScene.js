import {
    BasicShadowMap,
    Clock,
    FogExp2,
    LinearToneMapping,
    ObjectLoader,
    PCFShadowMap,
    PCFSoftShadowMap,
    Scene,
    WebGLRenderer
} from "three";
import OffscreenCamera from './OffscreenCamera';
import {
    OFFSCREEN_ADD_PARTICLES,
    OFFSCREEN_ADD_POSTPROCESSING,
    OFFSCREEN_ADD_ELEMENT,
    OFFSCREEN_REMOVE_ELEMENT,
    OFFSCREEN_AUDIO_LISTENER_UPDATE_EVENT,
    OFFSCREEN_CREATE,
    OFFSCREEN_DISPOSE,
    OFFSCREEN_INIT,
    OFFSCREEN_PROXYCAMERA_UPDATE_EVENT,
    OFFSCREEN_RESIZE_EVENT,
    OFFSCREEN_SET_CLEARCOLOR,
    OFFSCREEN_SET_CSM,
    OFFSCREEN_SET_SHADOWTYPE,
    OFFSCREEN_SET_TONE_MAPPING,
    OFFSCREEN_UPDATE_POSITION,
    OFFSCREEN_UPDATE_ROTATION,
    OFFSCREEN_UPDATE_CAMERA_POSITION,
    OFFSCREEN_UPDATE_CAMERA_ROTATION,
    OFFSCREEN_SET_FOG
} from "./events";
import Particles from "./Particles";
import PostProcessing from "./PostProcessing";
import { evaluateCameraPosition } from "../lib/camera";
import CascadeShadowMaps from '../lights/csm/CascadeShadowMaps';


const SHADOW_TYPES = {
    basic: BasicShadowMap,
    soft: PCFSoftShadowMap,
    hard: PCFShadowMap
};
const DEFAULT_SHADOWTYPE = 'soft';
class OffscreenScene {

    constructor() {
        this.clock = new Clock();
        this.rendererElements = {};
        this.clearColor = 0x000000;

        this.shadowType = SHADOW_TYPES[DEFAULT_SHADOWTYPE];

        this.objectLoader = new ObjectLoader();
        this.postProcessing = new PostProcessing();
        this.particles = new Particles();

        this.csm = null;
        this.elements = {};
    }

    create({ config, canvas }) {
        this.config = config;
        this.canvas = canvas;

        this.createScene();
        this.createCamera();
        this.createRenderer();
    }

    init() {
        this.postProcessing.init(this.renderer, this.scene, this.camera.getBody());
        this.particles.init(this.scene);

        this.render();
    }

    isUsingCSM() {
        return !!this.csm;
    }

    createScene() {
        const { fog } = this.config;

        this.scene = new Scene();

        if (fog.enabled) {
            this.fog(fog.color, fog.density);
        }
    }

    createCamera() {
        const { screen, camera } = this.config;
        const { ratio } = screen;
        const { fov, near, far } = camera;

        this.camera = new OffscreenCamera({
            fov,
            ratio,
            near,
            far
        });
    }

    getCamera() {
        return this.camera;
    }

    getCameraBody() {
        return this.camera.body;
    }

    createRenderer() {
        const { lights, screen } = this.config;
        const { shadows } = lights;
        const { alpha, w, h, devicePixelRatio } = screen;

        this.canvas.style = { width: 0, height: 0 }; // this is likely needed by three
        this.renderer = new WebGLRenderer({ alpha, antialias: true, canvas: this.canvas });

        if (shadows) {
            this.setRendererShadowMap();
        }

        this.renderer.setPixelRatio(devicePixelRatio);
        this.renderer.setSize(w, h);
    }

    setFog = ({ color, density }) => {
        this.scene.fog = new FogExp2(color, density);
    }

    setRendererShadowMap = () => {
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = this.shadowType;
        this.renderer.sortObjects = false;
    }

    setClearColor = ({ color }) => {
        if (this.renderer) {
            this.clearColor = color;
            this.renderer.setClearColor(color);
        }
    }

    setShadowType = ({ shadowType = DEFAULT_SHADOWTYPE }) => {
        if (Object.keys(SHADOW_TYPES).includes(shadowType)) {
            this.shadowMap = SHADOW_TYPES[shadowType];
            this.setRendererShadowMap();
        }
    }

    setBackground = ({ background }) => {
        this.scene.background = background;
    }

    setRendererToneMapping = ({ toneMapping = LinearToneMapping, toneMappingExposure = 1 }) => {
        this.renderer.toneMapping = toneMapping;
        this.renderer.toneMappingExposure = toneMappingExposure;
    }
    
    setFog = ({ color, density }) => {
        this.scene.fog = new FogExp2(color, density);
    }

    setUpCSM = ({ options = {}}) => {
        this.csm = new CascadeShadowMaps({
            ...options,
            camera: this.getCameraBody(),
            parent: this.scene
        });
    }

    addPostProcessingEffect = ({ effect, options }) => {
        this.postProcessing.add(effect, options);
    }

    addParticleEmitter = ({ emitterId, options }) => {
        this.particles.addParticleEmitter(emitterId, { ...options, container: this.scene });
    }

    add = ({ json }) => {
        const body = this.objectLoader.parse(json);

        this.elements[body.uuid] = body;

        this.scene.add(body);
    }

    remove = ({ uuid }) => {
        const body = this.elements[uuid];
        if (body) {
            this.scene.remove(body);
        }
    }

    updateRotation = ({ uuid, rotation }) => {
        const body = this.elements[uuid];
        if (body) {
            body.rotation.set(rotation.x, rotation.y, rotation.z);
        }
    }

    updateCameraRotation = ({ rotation }) => {
        this.camera.setRotation(rotation);
    };

    updatePosition = ({ uuid, position }) => {
        const body = this.elements[uuid];
        if (body) {
            body.position.set(position.x, position.y, position.z);
        }
    }

    updateCameraPosition = ({ position }) => {
        this.camera.setPosition(position);
    };

    onResize = ({ height, width, ratio, devicePixelRatio }) => {
        this.camera.getBody().aspect = ratio;
        this.camera.getBody().updateProjectionMatrix();
        this.renderer.setSize(width, height);

        this.postProcessing.onResize(h, w, ratio, devicePixelRatio);
    }

    onAudioListenerUpdate = () => (
        postMessage({
            event: OFFSCREEN_AUDIO_LISTENER_UPDATE_EVENT,
            ...evaluateCameraPosition(this.camera.body)
        })
    );

    onProxyCameraUpdate = (dt) => {
        const position = this.camera.getPosition().clone();
        const quaternion = this.camera.getQuaternion().clone();
        return (
            postMessage({
                event: OFFSCREEN_PROXYCAMERA_UPDATE_EVENT,
                position: {
                    x: position.x,
                    y: position.y,
                    z: position.z
                },
                quaternion: {
                    x: quaternion.x,
                    y: quaternion.y,
                    z: quaternion.z,
                    w: quaternion.w,
                },
                dt
            })
        );
    }

    render = () => {
        const dt = this.clock.getDelta();
        // using postprocessing here
        this.postProcessing.render(dt);
        // updating particles
        this.particles.update(dt);
        // sending back message with camera position for Audio
        this.onAudioListenerUpdate();
        // updating proxy camera outside
        this.onProxyCameraUpdate(dt);
        // probably sending back message for Controls

        if (this.isUsingCSM()) {
            this.csm.update();
        }

        this.animationFrameId = requestAnimationFrame(this.render.bind(this));
    }

    dispose = () => {
        cancelAnimationFrame(this.animationFrameId);

        this.scene.dispose();
        this.renderer.dispose();

        this.postProcessing.dispose();
        this.particles.dispose();
    }

};

const offscreenScene = new OffscreenScene();

onmessage = ({ data }) => {
    const { event } = data;

    switch(event) {
        case OFFSCREEN_CREATE:
            offscreenScene.create(data);
            break;
        case OFFSCREEN_INIT:
            offscreenScene.init(data);
            break;
        case OFFSCREEN_DISPOSE:
            offscreenScene.dispose();
            break;
        case OFFSCREEN_SET_CLEARCOLOR:
            offscreenScene.setClearColor(data);
            break;
        case OFFSCREEN_SET_SHADOWTYPE:
            offscreenScene.setShadowType(data);
            break;
        case OFFSCREEN_SET_TONE_MAPPING:
            offscreenScene.setRendererToneMapping(data);
            break;
        case OFFSCREEN_SET_FOG:
            offscreenScene.setFog(data);
            break;
        case OFFSCREEN_SET_CSM:
            offscreenScene.setUpCSM(data);
            break;
        case OFFSCREEN_ADD_POSTPROCESSING:
            offscreenScene.addPostProcessingEffect(data);
            break;
        case OFFSCREEN_ADD_PARTICLES:
            offscreenScene.addParticleEmitter(data);
            break;
        case OFFSCREEN_ADD_ELEMENT:
            offscreenScene.add(data);
            break;
        case OFFSCREEN_REMOVE_ELEMENT:
            offscreenScene.remove(data);
            break;
        case OFFSCREEN_UPDATE_POSITION:
            offscreenScene.updatePosition(data);
            break;
        case OFFSCREEN_UPDATE_ROTATION:
            offscreenScene.updateRotation(data);
            break;
        case OFFSCREEN_UPDATE_CAMERA_POSITION:
            offscreenScene.updateCameraPosition(data);
            break;
        case OFFSCREEN_UPDATE_CAMERA_ROTATION:
            offscreenScene.updateCameraRotation(data);
            break;
        case OFFSCREEN_RESIZE_EVENT:
            offscreenScene.onResize(data);
            break;
    }
};

