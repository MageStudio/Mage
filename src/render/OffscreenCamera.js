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

    getRotation() {
        return this.body.rotation;
    }

    getQuaternion() {
        return this.body.quaternion;
    }

    setPosition(where) {
        const { x, y, z } = this.getPosition();
        const position = {
            x: where.x === undefined ? x : where.x,
            y: where.y === undefined ? y : where.y,
            z: where.z === undefined ? z : where.z
        };

        this.body.position.set(position.x, position.y, position.z);
    }

    setRotation(how) {
        const { x, y, z } = this.getRotation();
        const rotation = {
            x: how.x === undefined ? x : how.x,
            y: how.y === undefined ? y : how.y,
            z: how.z === undefined ? z : how.z
        };

        this.body.rotation.set(rotation.x, rotation.y, rotation.z);
    }

    setZoom(zoom) {
        this.body.zoom = zoom;
    }

    getZoom() {
        return this.body.zoom;
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