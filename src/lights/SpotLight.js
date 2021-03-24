import Light from './Light';
import Config from '../core/config';
import { Element } from '../entities';
import {
    SpotLight as THREESpotLight,
    SpotLightHelper,
    CameraHelper,
    MeshBasicMaterial,
    SphereGeometry
} from 'three';
import RenderPipeline from '../render/RenderPipeline';
import { SPOTLIGHT } from './Lights';

const DEFAULT_NEAR = 0.1;
const DEFAULT_FAR = 100;

const DEFAULT_POSITION = { x: 0, y: 0, z: 0 };
const DEFAULT_TARGET_POSITION = { x: 0, y: 0, z: 0 };
const DEFAULT_INTENSITY = 0.5;
const DEFAULT_MAP_SIZE = 2048;
const DEFAULT_BIAS = -0.0001;
const WHITE = 0xffffff;
const GREEN = 0x2ecc71;

export default class SpotLight extends Light {

    constructor(options) {
        const {
            color = WHITE,
            intensity = DEFAULT_INTENSITY,
            name
        } = options;
        
        super({ color, intensity, name });
        this.options = options;
        this.setLight({ color, intensity });
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

    setLight({
        light,
        color = WHITE,
        intensity = DEFAULT_INTENSITY
    }) {
        if (light) {
            this.light = light;
        } else {
            this.light = new THREESpotLight(color, intensity);
        }

        if (this.hasLight()) {
            this.postLightCreation();
        }
    }

    postLightCreation() {
        const {
            position = DEFAULT_POSITION,
            target = DEFAULT_TARGET_POSITION
        } = this.options;

        this.setPosition(position);
        this.setTargetPosition(target);
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

    setTargetPosition(position = {}) {
        this.target = {
            ...this.target,
            ...position
        };

        const { x = 0, y = 0, z = 0 } = this.target;
        this.light.target.position.set(x, y, z);
    }

    getTargetPosition() {
        return this.target;
    }

    addHelper() {
        this.helper = new SpotLightHelper(this.light, GREEN);
        this.shadowHelper = new CameraHelper(this.light.shadow.camera);

        RenderPipeline.add(this.helper, null, false);
        RenderPipeline.add(this.shadowHelper, null, false);

        this.addHolder();
    }

    hasTarget() {
        return !!this.target;
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
            type: SPOTLIGHT
        }
    }
}
