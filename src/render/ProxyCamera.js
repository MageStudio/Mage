import { Vector3, PerspectiveCamera } from 'three';

class ProxyCamera {

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

    getBody() {
        return this.body;
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