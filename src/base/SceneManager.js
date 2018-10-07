import Universe from './Universe';
import { Clock } from 'three';

export class SceneManager {

    constructor() {
        this.clock = new Clock();
    }

    setConfig(config) {
        this.config = config;
    }

    createScene() {
        const { physics_enabled = false } = this.config;
        const ammo = 'ammo.js';
        const worker = 'workers/physijs_worker.js';

        if (physics_enabled && Physijs) {
            Physijs.scripts.worker = worker;
            Physijs.scripts.ammo = ammo;
            this.scene = new Physijs.Scene();
            Physijs._isLoaded = true;
        } else {
            Physijs._isLoaded = false;
            this.scene = new Scene();
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
        this.renderer.setClearColor(value);
    }

    create() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
    }

    createCamera() {
        const cameraOptions = {
            fov : this.config.camera.fov,
            ratio : this.config.ratio,
            near : this.config.camera.near,
            far : this.config.camera.far
        };

        this.camera = new Camera(cameraOptions);
    }

    createRenderer() {
        const alphaRenderer = !!this.config.alpha;

        this.renderer = new WebGLRenderer({alpha: alphaRenderer, antialias: true});

        if (this.config.cast_shadow) {
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = PCFSoftShadowMap;
            this.renderer.sortObjects = false;
        }

        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( this.config.w , this.config.h );

        document.getElementById("gameContainer").appendChild(this.renderer.domElement);
    }

    onResize(config) {
        this.config = config;

        if (!this.camera || !this.renderer) return;

        this.camera.object.aspect = this.config.ratio;
        this.camera.object.updateProjectionMatrix();
        this.renderer.setSize(this.config.w, this.config.h);
    }

    update() {

        Universe.update(this.clock.getDelta()));

        this.renderer.autoClear = false;
        this.renderer.clear(this.clearColor);
        this.renderer.render(this.scene, this.camera.object);

        if (this.config.physics_enabled && Physijs._isLoaded) {
            this.scene.simulate();
        }
        if (this.config.tween_enabled) {
            TWEEN.update();
        }

        //updating camera if we need to do so.
        if (this.camera.update) {
            this.camera.update(this.clock.getDelta());
        }
    }
}

export default new SceneManager();
