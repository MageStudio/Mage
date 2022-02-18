import { Entity } from './index';
import { PerspectiveCamera, Vector3 } from 'three';

export default class Camera extends Entity {

    constructor(options) {
        const name = options.name || 'camera';
        super({ name });

        this.options = options;
        this.setBody(new PerspectiveCamera(
            options.fov,
            options.ratio,
            options.near,
            options.far
        ));
    }

    getPosition() {
        return this.body.position;
    }

    getDirection() {
        const vector = new Vector3();
        const { x, y, z } = this.getBody().getWorldDirection(vector);

        return {
            x,
            y,
            z
        }
    }

    lookAt(position = {}) {
        const { x = 0, y = 0, z = 0 } = position;
        this.body.lookAt(x, y, z);
    }
}
