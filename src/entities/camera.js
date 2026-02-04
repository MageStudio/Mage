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
            serializable = true,
        } = options;

        super({ name, serializable });

        this.extendOptions(options);
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

    getFov() {
        return this.getBody().fov;
    }

    setFov(fov) {
        const num = Number(fov);
        const numericFov = Number.isFinite(num) ? num : 75;
        this.getBody().fov = numericFov;
        this.getBody().updateProjectionMatrix();
    }

    getNear() {
        return this.getBody().near;
    }

    setNear(near) {
        const num = Number(near);
        const numericNear = Number.isFinite(num) ? num : 0.1;
        this.getBody().near = numericNear;
        this.getBody().updateProjectionMatrix();
    }

    getFar() {
        return this.getBody().far;
    }

    setFar(far) {
        const num = Number(far);
        const numericFar = Number.isFinite(num) ? num : 3000000;
        this.getBody().far = numericFar;
        this.getBody().updateProjectionMatrix();
    }

    toJSON(parseJSON = false) {
        if (this.isSerializable()) {
            return {
                ...super.toJSON(parseJSON),
                fov: this.getFov(),
                near: this.getNear(),
                far: this.getFar(),
            };
        }
    }
}
