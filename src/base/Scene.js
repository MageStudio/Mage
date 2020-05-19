import Universe from './Universe';
import Camera from '../entities/Camera';
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

        if (fog.enabled) {
            this.fog(fog.color, fog.density);
        }
    }

    getScene() {
        return this.scene;
    }

    updateChildren() {
        for (var i in this.scene.children) {
            if (this.scene.children[i].material) {
                this.scene.children[i].material.needsUpdate = true;
            }
        }
    }

    add(mesh, element, addUniverse = true) {
		this.scene.add(mesh);
        if (addUniverse) {
            Universe.set(element.name, element);
            Universe.storeUUIDToElementNameReference(mesh.uuid, element.name);
        }
	}

	remove(mesh) {
		this.scene.remove(mesh);
		Universe.remove(mesh.name);
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

    getCamera() {
        return this.camera;
    }

    getCameraObject() {
        return this.camera.object;
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

        this.camera.object.aspect = ratio;
        this.camera.object.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    }

    render = () => {
        this.renderer.setClearColor(this.clearColor);
        this.renderer.clear();
        this.renderer.setRenderTarget(null);
        this.renderer.render(this.scene, this.camera.object);
    }

    fog(color, density) {
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

        if (Config.tween().enabled && TWEEN) {
            TWEEN.update();
        }

        //updating camera if we need to do so.
        if (this.camera.update) {
            this.camera.update(dt);
        }
    }
}

export default new Scene();
