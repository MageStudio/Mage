import Light from "./Light";
import Config from "../core/config";
import Element from "../entities/Element";
import {
    DirectionalLight as THREEDirectionalLight,
    DirectionalLightHelper,
    CameraHelper,
} from "three";
import Scene from "../core/Scene";
import { ENTITY_TYPES } from "../entities/constants";
import { generateRandomName } from "../lib/uuid";
import { ORIGIN } from "../lib/constants";
import { Object3D } from "three";

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
            name = generateRandomName("SunLight"),
        } = options;

        super({ color, intensity, name });
        this.options = options;
        this.target = ORIGIN;

        this.setLight({ color, intensity });
        this.setEntityType(ENTITY_TYPES.LIGHT.SUN);
        this.setName(name);
    }

    setLight({ light, color = WHITE, intensity = DEFAULT_INTENSITY }) {
        if (light) {
            this.setBody({ body: light });
        } else {
            this.setBody({ body: new THREEDirectionalLight(color, intensity) });
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
            fov = DEFAULT_FOV,
        } = this.options;

        if (Config.lights().shadows) {
            this.setCastShadow(true);
            this.setMapSize(mapSize);
            this.setShadowCameraNearFar(near, far);
            this.setBias(bias);
            this.setShadowCameraFov(fov);
        }
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

    setShadowCameraFov(fov = DEFAULT_FOV) {
        this.fov = fov;
        this.getBody().shadow.camera.fov = fov;
    }

    getShadowCameraFov() {
        return this.fov;
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

    hasTarget() {
        return true;
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
        holderName = "sunlightholder",
        holderSize = 0.05,
        targetHolderName = "targetholder",
        targetHolderSize = 0.05,
    } = {}) {
        this.helper = new DirectionalLightHelper(this.getBody(), 5);
        this.shadowHelper = new CameraHelper(this.getBody().shadow.camera);

        Scene.add(this.helper, null, false);
        Scene.add(this.shadowHelper, null, false);

        this.addHolder(holderName, holderSize);
        this.addTargetHolder(targetHolderName, targetHolderSize);

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

    toJSON() {
        return {
            ...super.toJSON(),
            target: this.getTarget(),
            distance: this.getDistance(),
            decay: this.getDecay(),
            bias: this.getBias(),
            mapSize: this.getMapSize(),
            shadowCamera: {
                ...this.getShadowCameraNearFar(),
                fov: this.setShadowCameraFov(),
            },
            penumbra: this.getPenumbra(),
            angle: this.getAngle(),
        };
    }
}
