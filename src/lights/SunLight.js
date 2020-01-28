import Light from './Light';
import Config from '../base/config';
import Mesh from '../entities/mesh';
import {
    DirectionalLight as THREEDirectionalLight,
    MeshBasicMaterial,
    SphereGeometry,
    DirectionalLightHelper
} from 'three';
import SceneManager from '../base/SceneManager';
import { SUNLIGHT } from './lightEngine';

export default class SunLight extends Light {

    constructor({ color, intensity, position = {}, target = {}, name }) {
        super({ name });

        this.light = new THREEDirectionalLight(color, intensity);

        const { x = 0, y = 1, z = 0 } = position;
        this.light.position.set(x, y, z);

        if (target) {
            this.target = target;
            const { x = 0, y = 0, z = 0 } = target;
            this.light.target.position.set(x, y, z);
        }

        if (Config.lights().shadows) {
            this.light.castShadow = true;
            this.light.shadow.mapSize.width = 2048;
            this.light.shadow.mapSize.height = 2048;

            const d = 300;

            this.light.shadow.camera.left = -d;
            this.light.shadow.camera.right = d;
            this.light.shadow.camera.top = d;
            this.light.shadow.camera.bottom = -d;

            this.light.shadow.camera.far = 1000;
        }

        SceneManager.add(this.light, this);
    }

    getTargetMesh(initialPosition) {
        const geometry = new SphereGeometry(3, 6, 6);
        const material = new MeshBasicMaterial({
            color: 0xeeeeee,
            wireframe: true
        });

        const target = new Mesh(geometry, material);

        target.position = initialPosition;

        return target;
    }

    targetPosition(options) {
        if (this.target && options === undefined) {
            return { ...this.target.position };
        }

        if (!this.target) {
            this.target = this.getTargetMesh(options);
        }

        const { x, y, z } = this.target.position;

        const position = {
            x: options.x === undefined ? x : options.x,
            y: options.y === undefined ? y : options.y,
            z: options.x === undefined ? z : options.z
        };

        if (this.target) {
            this.target.position = position;
            this.light.target.position.set(position.x, position.y, position.z);
        }
    }

    addHelper() {
        this.helper = new DirectionalLightHelper(this.light, 10);
        SceneManager.add(this.helper, null, false);
        this.addHolder();
    }

    hasTarget() {
        return !!this.target && !!this.holder;
    }

    update(dt) {
        super.update(dt);
        if (this.hasHelper()) {
            this.shouldUpdateHolder(false);
            this.position = this.holder.position();
            this.shouldUpdateHolder(true);

            this.helper.update();
        }
    }

    toJSON() {
        return {
            ...super.toJSON(),
            type: SUNLIGHT
        }
    }
}
