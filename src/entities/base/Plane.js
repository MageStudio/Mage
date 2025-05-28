import Element from "../Element";
import { ENTITY_TYPES } from "../constants";

import { PlaneGeometry, DoubleSide, Vector3, MeshBasicMaterial } from "three";
import Color from "../../lib/Color";

const UP = new Vector3(0, 1, 0);
const DOWN = new Vector3(0, -1, 0);

export default class Plane extends Element {
    constructor(height, width, color = Color.randomColor(true), options = {}) {
        super({
            height,
            width,
            color,
            ...options,
        });

        this.height = height;
        this.width = width;
        this.color = color;

        const { transparent = false, opacity = 1 } = options;

        const material = new MeshBasicMaterial({ color, side: DoubleSide, transparent, opacity });
        const geometry = new PlaneGeometry(width, height);

        this.setBody({ geometry, material });
        this.setEntityType(ENTITY_TYPES.MESH.TYPE);
        this.setEntitySubtype(ENTITY_TYPES.MESH.SUBTYPES.PLANE);
    }

    static get UP() {
        return UP;
    }
    static get DOWN() {
        return DOWN;
    }

    toJSON(parseJSON = false) {
        if (this.isSerializable()) {
            return {
                ...super.toJSON(parseJSON),
                height: this.height,
                width: this.width,
                color: this.color,
            };
        }
    }

    face(direction) {
        const vector = new Vector3(direction.x, direction.y, direction.z);

        this.body.lookAt(vector);
    }

    static create(data = {}) {
        return new Plane(data.height, data.width, data.color, data.options);
    }
}
