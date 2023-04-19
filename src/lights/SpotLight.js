import Light from "./Light";
import Config from "../core/config";
import Element from "../entities/Element";
import { SpotLight as THREESpotLight, SpotLightHelper, CameraHelper, Object3D } from "three";
import Scene from "../core/Scene";
import { ENTITY_TYPES } from "../entities/constants";
import { generateRandomName } from "../lib/uuid";

const DEFAULT_NEAR = 0.1;
const DEFAULT_FAR = 100;

const DEFAULT_POSITION = { x: 0, y: 0, z: 0 };
const DEFAULT_INTENSITY = 0.5;
const DEFAULT_MAP_SIZE = 2048;
const DEFAULT_BIAS = -0.0001;
const WHITE = 0xffffff;
const GREEN = 0x2ecc71;

const DEFAULT_SPOTLIGHT_ANGLE = 0.32;
const DEFAULT_SPOTLIGHT_PENUMBRA = 0.5;
const DEFAULT_SPOTLIGHT_DECAY = 2;

export default class SpotLight extends Light {
    constructor(options = {}) {
        const {
            color = WHITE,
            intensity = DEFAULT_INTENSITY,
            name = generateRandomName("SpotLight"),
            distance = DEFAULT_FAR,
            angle = DEFAULT_SPOTLIGHT_ANGLE,
            penumbra = DEFAULT_SPOTLIGHT_PENUMBRA,
            decay = DEFAULT_SPOTLIGHT_DECAY,
        } = options;

        super({ color, intensity, name });
        this.options = options;
        this.setLight({ color, intensity, distance, angle, penumbra, decay });
        this.setEntityType(ENTITY_TYPES.LIGHT.SPOT);
        this.setName(name);
    }

    hasTarget() {
        return true;
    }

    setLight({
        light,
        color = WHITE,
        intensity = DEFAULT_INTENSITY,
        distance,
        angle,
        penumbra,
        decay,
    }) {
        if (light) {
            this.setBody({ body: light });
        } else {
            this.setBody({
                body: new THREESpotLight(color, intensity),
            });
            this.setDistance(distance);
            this.setAngle(angle);
            this.setPenumbra(penumbra);
            this.setDecay(decay);
        }

        if (this.hasBody()) {
            this.postLightCreation();
        }
    }

    postLightCreation() {
        const { position = DEFAULT_POSITION } = this.options;
        const emptyTarget = new Element({ body: new Object3D() });

        this.setPosition(position);
        this.setTarget(emptyTarget);
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

    setDistance(distance = DEFAULT_FAR) {
        this.distance = distance;

        this.getBody().distance = distance;
    }

    getDistance() {
        return this.distance;
    }

    setAngle(angle = DEFAULT_SPOTLIGHT_ANGLE) {
        this.angle = angle;

        this.getBody().angle = angle;
    }

    getAngle() {
        return this.angle;
    }

    setPenumbra(penumbra = DEFAULT_SPOTLIGHT_PENUMBRA) {
        this.penumbra = penumbra;

        this.getBody().penumbra = penumbra;
    }

    getPenumbra() {
        return this.penumbra;
    }

    setDecay(decay = DEFAULT_SPOTLIGHT_DECAY) {
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

    setTarget(target) {
        this.target = target;
        this.getBody().target = target.getBody();
        Scene.add(this.getBody().target, null, false);
    }

    getTarget() {
        return this.target;
    }

    addHelpers({
        holderName = "spotlightholder",
        holderSize = 0.05,
        targetHolderName = "targetholder",
        targetHolderSize = 0.05,
    } = {}) {
        this.helper = new SpotLightHelper(this.getBody(), GREEN);
        this.shadowHelper = new CameraHelper(this.getBody().shadow.camera);

        Scene.add(this.helper, null, false);
        Scene.add(this.shadowHelper, null, false);

        this.addHolder(holderName, holderSize);
        this.addTargetHolder(targetHolderName, targetHolderSize);

        this.isUsingHelper = true;
    }

    hasTarget() {
        return !!this.target;
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

    toJSON() {
        return {
            ...super.toJSON(),
            target: this.getTarget(),
            distance: this.getDistance(),
            decay: this.getDecay(),
            bias: this.getBias(),
            mapSize: this.getMapSize(),
            shadowCamera: this.getShadowCameraNearFar(),
            penumbra: this.getPenumbra(),
            angle: this.getAngle(),
        };
    }
}
