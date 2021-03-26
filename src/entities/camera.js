import { Entity } from './index';
import { PerspectiveCamera, Vector3 } from 'three';
import RenderPipeline from '../render/RenderPipeline';

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

    setPosition(position) {
        super.setPosition(position);

        RenderPipeline.dispatchCameraPositionToOffscreen(position);
    }

    setRotation(rotation) {
        super.setRotation(rotation);

        RenderPipeline.dispatchCameraRotationToOffscreen(rotation);
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

    getZoom() {
        return this.getBody().zoom;
    }

    setZoom(zoom) {
        this.getBody().zoom = zoom;
    }

    lookAt(position = {}) {
        const { x = 0, y = 0, z = 0 } = position;
        this.body.lookAt(x, y, z);

        RenderPipeline.dispatchCameraLookAtToOffscreen(position);
    }
}
