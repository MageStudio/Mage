import Light from './Light';
import Config from '../core/config';
import { Element } from '../entities';
import {
    DirectionalLight as THREEDirectionalLight,
    MeshBasicMaterial,
    SphereGeometry,
    DirectionalLightHelper,
    CameraHelper
} from 'three';
import Scene from '../core/Scene';
import { SUNLIGHT } from './Lights';

const DEFAULT_NEAR = 0.1;
const DEFAULT_FAR = 100;
const DEFAULT_FOV = 75;

const DEFAULT_POSITION = { x: 0, y: 1, z: 0 };
const DEFAULT_INTENSITY = 0.5;
const DEFAULT_MAP_SIZE = 512;
const DEFAULT_BIAS = -0.0001;
const WHITE = 0xffffff;

export default class SunLight extends Light {

    constructor(options = {}) {
        const {
            color = WHITE,
            intensity = DEFAULT_INTENSITY,
            name,
        } = options;

        super({ color, intensity, name });
        this.options = options;
        this.setLight({ color, intensity });
    }

    setLight({
        light,
        color = WHITE,
        intensity = DEFAULT_INTENSITY
    }) {
        if (light) {
            this.light = light;
        } else {
            this.light = new THREEDirectionalLight(color, intensity);
        }

        if (this.hasLight()) {
            this.postLightCreation();
        }
    }

    postLightCreation() {
        const {
            position = DEFAULT_POSITION,
            target
        } = this.options;

        this.setPosition(position);
        if (target) {
            this.setTarget(target);
        }
        this.setLightShadows();
        this.addToScene();
    }

    setLightShadows() {
        const {
            near = DEFAULT_NEAR,
            far = DEFAULT_FAR,
            mapSize = DEFAULT_MAP_SIZE,
            bias = DEFAULT_BIAS,
            fov = DEFAULT_FOV
        } = this.options;

        if (Config.lights().shadows) {
            this.light.castShadow = true;

            const d = far / 1.5;

            this.light.shadow.mapSize.height = mapSize;
            this.light.shadow.mapSize.width = mapSize;

            this.light.shadow.camera.left = -d;
            this.light.shadow.camera.right = d;
            this.light.shadow.camera.top = d;
            this.light.shadow.camera.bottom = -d;

            this.light.shadow.camera.near = near;
            this.light.shadow.camera.far = far;
            this.light.shadow.camera.fov = fov;

            this.light.shadow.bias = bias;
        }
    }

    getTargetMesh(initialPosition) {
        const geometry = new SphereGeometry(3, 6, 6);
        const material = new MeshBasicMaterial({
            color: 0xeeeeee,
            wireframe: true
        });

        const target = new Element(geometry, material);

        target.position(initialPosition);

        return target;
    }

    setTarget(target) {
        if (target.position) {
            this.light.target = target;
            Scene.add(this.light.target, null, false);
        }
    }

    getTargetPosition() {
        return this.target;
    }

    addHelper() {
        this.helper = new DirectionalLightHelper(this.light, 5);
        this.shadowHelper = new CameraHelper(this.light.shadow.camera);

        Scene.add(this.helper, null, false);
        Scene.add(this.shadowHelper, null, false);

        this.addHolder();
    }

    update(dt) {
        super.update(dt);
        if (this.hasHelper()) {
            this.helper.update();
            this.shadowHelper.update();
        }

        if (this.hasHolder()) {
            this.setPosition(this.holder.getPosition(), { updateHolder: false });
        }
    }

    toJSON() {
        return {
            ...super.toJSON(),
            type: SUNLIGHT
        }
    }
}
