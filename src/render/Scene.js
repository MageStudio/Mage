import Universe from '../core/universe';
import { Camera } from '../entities';
import Config from '../core/config';
import {
    Clock,
    Scene as THREEScene,
    PCFSoftShadowMap,
    BasicShadowMap,
    PCFShadowMap,
    WebGLRenderer,
    FogExp2,
    LinearToneMapping
} from 'three';

import { generateUUID } from '../lib/uuid';
import PostProcessing from './PostProcessing';
import Particles from './Particles';

const SHADOW_TYPES = {
    basic: BasicShadowMap,
    soft: PCFSoftShadowMap,
    hard: PCFShadowMap
};
const DEFAULT_SHADOWTYPE = 'soft';

export class Scene {

    constructor() {
        this.clock = new Clock();
        this.rendererElements = {};
        this.clearColor = 0x000000;

        this.shadowType = SHADOW_TYPES[DEFAULT_SHADOWTYPE];

        this.postProcessing = new PostProcessing();
        this.particles = new Particles();
    }

    createScene() {
        const fog = Config.fog();

        this.scene = new THREEScene();

        // this.scene.overrideMaterial = null; // should be null by default, but it's not.

        if (fog.enabled) {
            this.fog(fog.color, fog.density);
        }
    }

    getScene() {
        return this.scene;
    }

    getChildren() {
        return this.scene.children;
    }

    updateChildren() {
        for (let i in this.scene.children) {
            if (this.scene.children[i].material) {
                this.scene.children[i].material.needsUpdate = true;
            }
        }
    }

    addPostProcessingEffect(effect, options) {
        this.postProcessing.add(effect, options);
    }

    addParticleEmitter(emitterId, options) {
        this.particles.addParticleEmitter(emitterId, options);
    }

    add(body) {
        this.scene.add(body);
    }

    remove(body) {
        this.scene.remove(body);
    }

    setClearColor(value) {
        if (this.renderer) {
            this.clearColor = value;
            this.renderer.setClearColor(value);
        }
    }

    setShadowType = (type = DEFAULT_SHADOWTYPE) => {
        if (Object.keys(SHADOW_TYPES).includes(type)) {
            this.shadowMap = SHADOW_TYPES[type];
            this.setRendererShadowMap();
        }
    }

    setBackground = background => {
        this.scene.background = background;
    } 

    create() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
    }

    init() {
        this.postProcessing.init(this.renderer, this.scene, this.camera.getBody());
        this.particles.init(this.scene);
    }

    dispose() {
        // destroy scene
        this.scene.dispose();
        // destroy renderer
        this.renderer.dispose();
    }

    createCamera() {
        const { ratio } = Config.screen();
        const { fov, near, far } = Config.camera();

        this.camera = new Camera({
            fov,
            ratio,
            near,
            far
        });
    }

    getDOMElement() {
        if (this.renderer) {
            return this.renderer.domElement;
        }
    }

    getCamera() {
        return this.camera;
    }

    getCameraBody() {
        return this.camera.getBody();
    }

    getRenderer() {
        return this.renderer;
    }

    getChildren() {
        return this.scene.children;
    }

    removeExistingRendererElements() {
        Object
            .keys(this.rendererElements)
            .forEach((k) => {
                const element = document.body.querySelector(`#${k}`);

                if (element) {
                    element.remove();
                }
            });

    }

    storeRenderer(rendererElement) {
        const id = `renderer_${generateUUID()}`;
        this.rendererElements[id] = rendererElement;

        return id;
    }

    setRendererShadowMap = () => {
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = this.shadowType;
        this.renderer.sortObjects = false;
    }

    createRenderer() {
        const { shadows } = Config.lights();
        const { alpha, w, h } = Config.screen();
        let container = Config.container();

        this.renderer = new WebGLRenderer({alpha, antialias: true});

        if (shadows) {
            this.setRendererShadowMap();
        }

        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(w, h);

        this.renderer.domElement.id = this.storeRenderer(this.renderer.domElement);
        this.removeExistingRendererElements();

        if (!container) {
            document.body.appendChild(this.renderer.domElement);
        } else {
            container.appendChild(this.renderer.domElement);
        }
    }

    setRendererToneMapping(toneMapping = LinearToneMapping, toneMappingExposure = 1) {
        this.renderer.toneMapping = toneMapping;
        this.renderer.toneMappingExposure = toneMappingExposure;
    }

    onResize = (h, w, ratio, devicePixelRatio) => {
        if (!this.camera || !this.renderer) return;

        this.camera.getBody().aspect = ratio;
        this.camera.getBody().updateProjectionMatrix();
        this.renderer.setSize(w, h);

        this.postProcessing.onResize(h, w, ratio, devicePixelRatio);
    }

    render = (dt) => {
        this.postProcessing.render(dt);
        this.particles.update(dt);
    }

    setFog(color, density) {
        this.scene.fog = new FogExp2(color, density);
        Config.setConfig({
            fog: {
                enabled: true,
                color,
                density
            }
        });
    }

    update(dt) {
        Universe.update(dt);

        this.getCamera()
            .update(dt);
    }

    onPhysicsUpdate(dt) {
        Universe.onPhysicsUpdate(dt);
        this.getCamera()
            .onPhysicsUpdate(dt);
    }
}

export default new Scene();
