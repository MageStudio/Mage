import Universe from './Universe';
import Camera from '../entities/Camera';
import Config from './config';
import {
    Clock,
    Scene,
    PCFSoftShadowMap,
    WebGLRenderer,
    alphaRenderer,
    FogExp2
} from 'three';

import { generateUUID } from './util';

export class SceneManager {

    constructor() {
        this.clock = new Clock();
        this.rendererElements = {};
    }

    createScene() {
        const { enabled = false } = Config.physics();
        const ammo = 'ammo.js';
        const worker = 'workers/physijs_worker.js';

        if (enabled && Physijs) {
            Physijs.scripts.worker = worker;
            Physijs.scripts.ammo = ammo;
            this.scene = new Physijs.Scene();
            this.physics = true;
        } else {
            const fog = Config.fog();

            this.physics = false;
            this.scene = new Scene();

            if (fog.enabled) {
                this.fog(fog.color, fog.density);
            }
        }
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
        }
	}

	remove(mesh) {
		this.scene.remove(mesh);
		Universe.remove(mesh.name);
	}

    setClearColor(value) {
        if (this.renderer) {
            this.renderer.setClearColor(value);
        }
    }

    create() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
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

    createRenderer() {
        const { shadows } = Config.lights();
        const { alpha, w, h } = Config.screen();
        let container = Config.container();

        this.renderer = new WebGLRenderer({alpha, antialias: true});

        if (shadows) {
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = PCFSoftShadowMap;
            this.renderer.sortObjects = false;
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
        //this.renderer.autoClear = false;
        //this.renderer.clear();
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

    update() {
        Universe.update(this.clock.getDelta());

        if (Config.physics().enabled && this.physics) {
            this.scene.simulate();
        }
        if (Config.tween().enabled && TWEEN) {
            TWEEN.update();
        }

        //updating camera if we need to do so.
        if (this.camera.update) {
            this.camera.update(this.clock.getDelta());
        }
    }
}

export default new SceneManager();
