import { PerspectiveCamera } from "three";

export default class OffscreenCamera {
    
    constructor(options) {
        const { fov, ratio, near, far } = options;
        this.name = 'offscreencamera';

        this.body = new PerspectiveCamera(fov, ratio, near, far);
    }

    getBody() {
        return this.body;
    }

    getPosition() {
        return this.body.position;
    }

    getDirection() {
        const vector = new Vector3();
        return this.body.getWorldDirection(vector);
    }

    lookAt(position = {}) {
        const { x = 0, y = 0, z = 0 } = position;
        this.body.lookAt(x, y, z);
    }
}