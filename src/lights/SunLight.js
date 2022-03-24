import Light from './Light';
import Config from '../core/config';
import Element from '../entities/Element';
import {
    DirectionalLight as THREEDirectionalLight,
    MeshBasicMaterial,
    SphereGeometry,
    DirectionalLightHelper,
    CameraHelper
} from 'three';
import Scene from '../core/Scene';
import { SUNLIGHT } from './Lights';
import { ENTITY_TYPES } from '../entities/constants';

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
            name = `SunLight_${Math.random()}`,
        } = options;

        super({ color, intensity, name });
        this.options = options;
        this.setLight({ color, intensity });
        this.setEntityType(ENTITY_TYPES.LIGHT.SUN);
        this.setName(name);
    }

    setLight({
        light,
        color = WHITE,
        intensity = DEFAULT_INTENSITY
    }) {
        if (light) {
            this.setBody(light);
        } else {
            this.setBody(new THREEDirectionalLight(color, intensity));
        }

        if (this.hasBody()) {
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
            this.body.castShadow = true;

            const d = far / 1.5;

            this.body.shadow.mapSize.height = mapSize;
            this.body.shadow.mapSize.width = mapSize;

            this.body.shadow.camera.left = -d;
            this.body.shadow.camera.right = d;
            this.body.shadow.camera.top = d;
            this.body.shadow.camera.bottom = -d;

            this.body.shadow.camera.near = near;
            this.body.shadow.camera.far = far;
            this.body.shadow.camera.fov = fov;

            this.body.shadow.bias = bias;
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
            this.body.target = target;
            Scene.add(this.body.target, null, false);
        }
    }

    getTargetPosition() {
        return this.target;
    }

    addHelper() {
        this.helper = new DirectionalLightHelper(this.body, 5);
        this.shadowHelper = new CameraHelper(this.body.shadow.camera);

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
