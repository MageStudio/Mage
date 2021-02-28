import Universe from './Universe';
import { Camera } from '../entities';
import Config from './config';
import { getWindow } from './window';
import {
    Clock,
    Scene as THREEScene,
    PCFSoftShadowMap,
    BasicShadowMap,
    PCFShadowMap,
    WebGLRenderer,
    FogExp2
} from 'three';

import { generateUUID } from '../lib/uuid';
import Images from '../images/Images';

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

    add(body, element, addUniverse = true) {
        this.scene.add(body);
        if (addUniverse) {
            Universe.set(element.getName(), element);
            Universe.storeUUIDToElementNameReference(body.uuid, element.getName());
        }
    }

    remove(body) {
        this.scene.remove(body);
        Universe.remove(body.name);
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

    setBackground = texture => {
        this.scene.background = typeof texture === 'string' ? Images.get(texture) : texture;
    } 

    create() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.listenToResizeEvent();
    }

    listenToResizeEvent() {
        const win = getWindow();
        if (win) {
            win.addEventListener('resize', this.onResize);
        }
    }

    stopResizeListener() {
        const win = getWindow();
        if (win) {
            win.removeEventListener('resize', this.onResize);
        }
    }

    dispose() {
        // destroy scene
        this.scene.dispose();
        // destroy renderer
        this.renderer.dispose();
        // remove listener to resize
        this.stopResizeListener();
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

    onResize = () => {
        const { h, w, ratio } = Config.screen();

        if (!this.camera || !this.renderer) return;

        this.camera.getBody().aspect = ratio;
        this.camera.getBody().updateProjectionMatrix();
        this.renderer.setSize(w, h);
    }

    render = () => {
        this.renderer.setClearColor(this.clearColor);
        this.renderer.clear();
        this.renderer.setRenderTarget(null);
        this.renderer.render(this.scene, this.camera.getBody());
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
