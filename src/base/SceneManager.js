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

export class SceneManager {

    constructor() {
        this.clock = new Clock();
    }

    setAssets(assets) {
        this.assets = assets;
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
            this.physics = false;
            this.scene = new Scene();
        }
    }

    updateChildren() {
        for (var i in this.scene.children) {
            if (this.scene.children[i].material) {
                this.scene.children[i].material.needsUpdate = true;
            }
        }
    }

    add(mesh, element) {
		this.scene.add(mesh);
		Universe.set(mesh.uuid, element);
	}

	remove(mesh) {
		this.scene.remove(mesh);
		Universe.remove(mesh.uuid);
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

        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize(w, h);

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
        this.renderer.autoClear = false;
        this.renderer.clear(this.clearColor);
        this.renderer.render(this.scene, this.camera.object);
    }

    fog(color, intensity) {
        this.scene.fog = new FogExp2(color, intensity);
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
