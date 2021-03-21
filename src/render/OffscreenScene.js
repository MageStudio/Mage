import {
    BasicShadowMap,
    Clock,
    FogExp2,
    LinearToneMapping,
    ObjectLoader,
    PCFShadowMap,
    PCFSoftShadowMap,
    Scene
} from "three";
import OffscreenCamera from './OffscreenCamera';
import { OFFSCREEN_ADD_PARTICLES, OFFSCREEN_ADD_POSTPROCESSING, OFFSCREEN_CREATE, OFFSCREEN_DISPOSE, OFFSCREEN_INIT, OFFSCREEN_RESIZE_EVENT, OFFSCREEN_SET_CLEARCOLOR, OFFSCREEN_SET_SHADOWTYPE, OFFSCREEN_SET_TONE_MAPPING } from "./events";
import Particles from "./Particles";
import PostProcessing from "./PostProcessing";

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

    createRenderer() {
        const { lights, screen } = this.config;
        const { shadows } = lights;
        const { alpha, w, h, devicePixelRatio } = screen;

        this.renderer = new WebGLRenderer({ alpha, antialias: true });

        if (shadows) {
            this.setRendererShadowMap();
        }

        this.renderer.setPixelRatio(devicePixelRatio);
        this.renderer.setSize(w, h);
    }

    setFog({ color, density }) {
        this.scene.fog = new FogExp2(color, density);
    }

    setRendererShadowMap = () => {
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = this.shadowType;
        this.renderer.sortObjects = false;
    }

    setClearColor({ color }) {
        if (this.renderer) {
            this.clearColor = color;
            this.renderer.setClearColor(color);
        }
    }

    setShadowType({ shadowType = DEFAULT_SHADOWTYPE }) {
        if (Object.keys(SHADOW_TYPES).includes(shadowType)) {
            this.shadowMap = SHADOW_TYPES[shadowType];
            this.setRendererShadowMap();
        }
    }

    setBackground = ({ background }) => {
        this.scene.background = background;
    }

    setRendererToneMapping({ toneMapping = LinearToneMapping, toneMappingExposure = 1 }) {
        this.renderer.toneMapping = toneMapping;
        this.renderer.toneMappingExposure = toneMappingExposure;
    }
    
    setFog({ color, density }) {
        this.scene.fog = new FogExp2(color, density);
    }

    addPostProcessingEffect({ effect, options }) {
        this.postProcessing.add(effect, options);
    }

    addParticleEmitter({ emitterId, options }) {
        this.particles.addParticleEmitter(emitterId, options);
    }

    add({ json }) {
        const body = this.objectLoader.parse(json);

        this.scene.add(body);
    }

    onResize = ({ height, width, ratio, devicePixelRatio }) => {
        this.camera.getBody().aspect = ratio;
        this.camera.getBody().updateProjectionMatrix();
        this.renderer.setSize(width, height);

        this.postProcessing.onResize(h, w, ratio, devicePixelRatio);
    }

    render = () => {
        const dt = this.clock.getDelta();
        // using postprocessing here
        this.postProcessing.render(dt);
        // updating particles
        this.particles.update(dt);
        // sending back message with camera position for Audio
        // probably sending back message for Controls

        this.animationFrameId = requestAnimationFrame(this.render);
    }

    dispose = () => {
        cancelAnimationFrame(this.animationFrameId);

        this.scene.dispose();
        this.renderer.dispose();
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
        case OFFSCREEN_ADD_POSTPROCESSING:
            offscreenScene.addPostProcessingEffect(data);
            break;
        case OFFSCREEN_ADD_PARTICLES:
            offscreenScene.addParticleEmitter(data);
            break;
        case OFFSCREEN_ADD_ELEMENT:
            offscreenScene.add(data);
            break;
        case OFFSCREEN_DISPOSE:
            offscreenScene.dispose();
            break;
        case OFFSCREEN_RESIZE_EVENT:
            offscreenScene.onResize(data);
            break;
    }
};

