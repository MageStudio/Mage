import Light from './Light';
import Scene from '../core/Scene';
import Config from '../core/config';
import { POINTLIGHT } from './Lights';

import {
    PointLight as THREEPointLight,
    PointLightHelper,
    CameraHelper
} from 'three';
import { ENTITY_TYPES } from '../entities/constants';

const DEFAULT_NEAR = 0.1;
const DEFAULT_FAR = 100;

const DEFAULT_POSITION = { x: 0, y: 0, z: 0 };
const DEFAULT_INTENSITY = 0.5;
const DEFAULT_DISTANCE = 0;
const DEFAULT_DECAY = 1;
const DEFAULT_MAP_SIZE = 2048;
const DEFAULT_BIAS = -0.0001;
const WHITE = 0xffffff;
const GREEN = 0x2ecc71;

export default class PointLight extends Light {

    constructor(options) {
        const {
            color = WHITE,
            intensity = DEFAULT_INTENSITY,
            name = `PointLight_${Math.random()}`,
            distance,
            decay
        } = options;

        super({ color, intensity, name });
        this.options = options;
        this.setLight({ color, intensity, distance, decay });
        this.setEntityType(ENTITY_TYPES.LIGHT.POINT);
        this.setName(name);
    }

    setLight({
        light,
        color = WHITE,
        intensity = DEFAULT_INTENSITY,
        distance = DEFAULT_DISTANCE,
        decay = DEFAULT_DECAY
    }) {
        if (light) {
            this.setBody(light)
        } else {
            this.setBody(new THREEPointLight(color, intensity, distance, decay));
        }

        if (this.hasBody()) {
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
            this.body.castShadow = true;

            const d = far/2;

            this.body.shadow.mapSize.height = mapSize;
            this.body.shadow.mapSize.width = mapSize;

            this.body.shadow.camera.left = -d;
            this.body.shadow.camera.right = d;
            this.body.shadow.camera.top = d;
            this.body.shadow.camera.bottom = -d;

            this.body.shadow.camera.near = near;
            this.body.shadow.camera.far = far;

            this.body.shadow.bias = bias;
        }
    }

    addHelper() {
        this.helper = new PointLightHelper(this.body, 2, GREEN);
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
            distance: this.distance,
            type: POINTLIGHT
        }
    }
}
