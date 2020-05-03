import Light from './Light';
import Config from '../base/config';
import Mesh from '../entities/mesh';
import {
    DirectionalLight as THREEDirectionalLight,
    MeshBasicMaterial,
    SphereGeometry,
    DirectionalLightHelper
} from 'three';
import Scene from '../base/Scene';
import { SUNLIGHT } from './Lights';

const DEFAULT_NEAR = 0.1;
const DEFAULT_FAR = 40;

export default class SunLight extends Light {

    constructor({
        color,
        intensity,
        position = {},
        target = {},
        name,
        near = DEFAULT_NEAR,
        far = DEFAULT_FAR
    }) {
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

            const d = far/2;

            this.light.shadow.camera.left = -d;
            this.light.shadow.camera.right = d;
            this.light.shadow.camera.top = d;
            this.light.shadow.camera.bottom = -d;

            this.light.shadow.camera.near = near;
            this.light.shadow.camera.far = far;
        }

        Scene.add(this.light, this);
    }

    getTargetMesh(initialPosition) {
        const geometry = new SphereGeometry(3, 6, 6);
        const material = new MeshBasicMaterial({
            color: 0xeeeeee,
            wireframe: true
        });

        const target = new Mesh(geometry, material);

        target.position(initialPosition);

        return target;
    }

    targetPosition(options) {
        if (this.target && options === undefined) {
            return {
                ...this.target.getPosition()
            };
        }

        if (!this.target) {
            this.target = this.getTargetMesh(options);
        }

        const { x, y, z } = this.target.getPosition();

        const position = {
            x: options.x === undefined ? x : options.x,
            y: options.y === undefined ? y : options.y,
            z: options.x === undefined ? z : options.z
        };

        if (this.target) {
            this.target.position(position);
            this.light.target.position.set(position.x, position.y, position.z);
        }
    }

    addHelper() {
        this.helper = new DirectionalLightHelper(this.light, 10);
        Scene.add(this.helper, null, false);
        this.addHolder();
    }

    hasTarget() {
        return !!this.target && !!this.holder;
    }

    update(dt) {
        super.update(dt);
        if (this.hasHelper()) {
            this.position(this.holder.getPosition(), false);

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
