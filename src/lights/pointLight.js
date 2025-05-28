import Light from "./Light";
import Scene from "../core/Scene";
import Config from "../core/config";

import { PointLight as THREEPointLight, PointLightHelper, CameraHelper } from "three";
import { ENTITY_TYPES } from "../entities/constants";
import { generateRandomName } from "../lib/uuid";

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
    constructor(options = {}) {
        const {
            color = WHITE,
            intensity = DEFAULT_INTENSITY,
            name = generateRandomName("PointLight"),
            distance,
            decay,
        } = options;

        super({ color, intensity, name });
        this.options = options;
        this.setLight({ color, intensity, distance, decay });
        this.setEntityType(ENTITY_TYPES.LIGHT.TYPE);
        this.setEntitySubtype(ENTITY_TYPES.LIGHT.SUBTYPES.POINT);
        this.setName(name);
    }

    setLight({
        light,
        color = WHITE,
        intensity = DEFAULT_INTENSITY,
        distance = DEFAULT_DISTANCE,
        decay = DEFAULT_DECAY,
    }) {
        if (light) {
            this.setBody({ body: light });
        } else {
            this.setBody({ body: new THREEPointLight(color, intensity) });
            this.setDistance(distance);
            this.setDecay(decay);
        }

        if (this.hasBody()) {
            this.postLightCreation();
        }
    }

    postLightCreation() {
        const { position = DEFAULT_POSITION } = this.options;

        this.setPosition(position);
        this.setLightShadows();
        this.addToScene();
    }

    setLightShadows() {
        const {
            near = DEFAULT_NEAR,
            far = DEFAULT_FAR,
            mapSize = DEFAULT_MAP_SIZE,
            bias = DEFAULT_BIAS,
        } = this.options;

        if (Config.lights().shadows) {
            this.setCastShadow(true);
            this.setMapSize(mapSize);
            this.setShadowCameraNearFar(near, far);
            this.setBias(bias);
        }
    }

    setDistance(distance = DEFAULT_DISTANCE) {
        this.distance = distance;

        this.getBody().distance = distance;
    }

    getDistance() {
        return this.distance;
    }

    setDecay(decay = DEFAULT_DECAY) {
        this.decay = decay;

        this.getBody().decay = decay;
    }

    getDecay() {
        return this.decay;
    }

    setShadowCameraNearFar = (near = DEFAULT_NEAR, far = DEFAULT_FAR) => {
        this.near = near;
        this.far = far;

        const d = this.far / 2;

        this.getBody().shadow.camera.left = -d;
        this.getBody().shadow.camera.right = d;
        this.getBody().shadow.camera.top = d;
        this.getBody().shadow.camera.bottom = -d;

        this.getBody().shadow.camera.near = near;
        this.getBody().shadow.camera.far = far;
    };

    getShadowCameraNearFar() {
        return {
            near: this.near,
            far: this.far,
        };
    }

    setMapSize(mapSize = DEFAULT_MAP_SIZE) {
        this.mapSize = mapSize;

        this.getBody().shadow.mapSize.height = mapSize;
        this.getBody().shadow.mapSize.width = mapSize;
    }

    getMapSize() {
        return this.mapSize;
    }

    setBias = (bias = DEFAULT_BIAS) => {
        this.bias = bias;

        this.getBody().shadow.bias = bias;
    };

    getBias() {
        return this.bias;
    }

    addHelpers({ holderName = "pointlightholder", holderSize = 0.05 } = {}) {
        this.helper = new PointLightHelper(this.getBody(), 2, GREEN);
        this.shadowHelper = new CameraHelper(this.getBody().shadow.camera);

        Scene.add(this.helper, null, false);
        Scene.add(this.shadowHelper, null, false);

        this.addHolder(holderName, holderSize);

        this.isUsingHelper = true;
    }

    update(dt) {
        super.update(dt);
        if (this.usingHelper()) {
            this.helper.update();
            this.shadowHelper.update();
        }

        if (this.hasHolder()) {
            this.setPosition(this.holder.getPosition(), { updateHolder: false });
        }
    }

    toJSON(parseJSON) {
        return {
            ...super.toJSON(parseJSON),
            distance: this.getDistance(),
            decay: this.getDecay(),
            bias: this.getBias(),
            mapSize: this.getMapSize(),
            shadowCamera: this.getShadowCameraNearFar(),
        };
    }
}
