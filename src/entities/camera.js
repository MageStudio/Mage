import { PerspectiveCamera, Vector3 } from "three";
import config from "../core/config";
import { ENTITY_TYPES } from "./constants";
import Entity from "./Entity";

export default class Camera extends Entity {
    constructor(options = {}) {
        const {
            name = "Main PerspectiveCamera",
            fov = config.camera().fov,
            ratio = config.screen().ratio,
            near = config.camera().near,
            far = config.camera().far,
        } = options;

        super({ name });

        this.options = options;
        const body = new PerspectiveCamera(fov, ratio, near, far);

        this.setBody({ body });
        this.setEntityType(ENTITY_TYPES.CAMERA.TYPE);
        this.setEntitySubtype(ENTITY_TYPES.CAMERA.SUBTYPES.MAIN);
        this.setName(name);
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
            z,
        };
    }

    lookAt(position = {}) {
        const { x = 0, y = 0, z = 0 } = position;
        this.body.lookAt(x, y, z);
    }
}
