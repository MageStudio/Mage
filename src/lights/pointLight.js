import Light from './Light';
import Scene from '../core/Scene';
import { POINTLIGHT } from './Lights';

import {
    PointLight as THREEPointLight,
    PointLightHelper,
    CameraHelper
} from 'three';

const DEFAULT_NEAR = 0.1;
const DEFAULT_FAR = 100;

const DEFAULT_POSITION = { x: 0, y: 0, z: 0 };
const DEFAULT_INTENSITY = 0.5;
const DEFAULT_DISTANCE = 10;
const DEFAULT_MAP_SIZE = 2048;
const DEFAULT_BIAS = -0.0001;
const WHITE = 0xffffff;
const GREEN = 0x2ecc71;

export default class PointLight extends Light {

    constructor(options) {
        const {
            color = WHITE,
            intensity = DEFAULT_INTENSITY,
            name,
            distance
        } = options;

        super({ color, intensity, name });
        this.options = options;
        this.setLight({ color, intensity, distance });
    }

    setLight({
        light,
        color = WHITE,
        intensity = DEFAULT_INTENSITY,
        distance = DEFAULT_DISTANCE
    }) {
        if (light) {
            this.light = light;
        } else {
            this.light = new THREEPointLight(color, intensity, distance);
        }

        if (this.hasLight()) {
            this.postLightCreation();
        }
    }

    postLightCreation() {
        const {
            position = DEFAULT_POSITION
        } = this.options;

        this.setPosition(position);
        this.setLightShadows();
        this.addToScene();
    }

    setLightShadows() {
        const {
            near = DEFAULT_NEAR,
            far = DEFAULT_FAR,
            mapSize = DEFAULT_MAP_SIZE,
            bias = DEFAULT_BIAS
        } = this.options;

        if (Config.lights().shadows) {
            this.light.castShadow = true;

            const d = far/2;

            this.light.shadow.mapSize.height = mapSize;
            this.light.shadow.mapSize.width = mapSize;

            this.light.shadow.camera.left = -d;
            this.light.shadow.camera.right = d;
            this.light.shadow.camera.top = d;
            this.light.shadow.camera.bottom = -d;

            this.light.shadow.camera.near = near;
            this.light.shadow.camera.far = far;

            this.light.shadow.bias = bias;
        }
    }

    addHelper() {
        this.helper = new PointLightHelper(this.light, 2, GREEN);
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
            distance: this.distance,
            type: POINTLIGHT
        }
    }
}
