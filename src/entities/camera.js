import { Entity } from './index';
import { PerspectiveCamera } from 'three';

export default class Camera extends Entity {

    constructor(options) {
        const name = options.name || 'camera';
        super({ name });

        this.options = options;
        this.body = new PerspectiveCamera(
            options.fov,
            options.ratio,
            options.near,
            options.far
        );
    }

    getPosition() {
        return {
            x: this.body.position.x,
            y: this.body.position.y,
            z: this.body.position.z
        };
    }

    setPosition(where) {
        const position = {
            ...this.getPosition(),
            ...where
        };

        if (this.body) {
            this.body.position.set(position.x, position.y, position.z);
        }
    }

    getRotation() {
        return {
            x: this.body.rotation.x,
            y: this.body.rotation.y,
            z: this.body.rotation.z
        };
    }

    setRotation(how) {
        const rotation = {
            ...this.getRotation(),
            ...how
        };

        if (this.body) {
            this.body.rotation.set(rotation.x, rotation.y, rotation.z);
        }
    }

    lookAt(position = {}) {
        const { x = 0, y = 0, z = 0 } = position;
        this.body.lookAt(x, y, z);
    }
}
