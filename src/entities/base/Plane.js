import Element from "../Element";
import { ENTITY_TYPES } from "../constants";

import { PlaneGeometry, DoubleSide, Vector3, MeshBasicMaterial } from "three";
import Color from "../../lib/Color";

const UP = new Vector3(0, 1, 0);
const DOWN = new Vector3(0, -1, 0);

export default class Plane extends Element {
    constructor(height, width, color = Color.randomColor(true), options = {}) {
        super(options);

        const { transparent = false, opacity = 1 } = options;

        const material = new MeshBasicMaterial({ color, side: DoubleSide, transparent, opacity });
        const geometry = new PlaneGeometry(width, height);

        this.setBody({ geometry, material });
        this.setEntityType(ENTITY_TYPES.MESH);
    }

    static get UP() {
        return UP;
    }
    static get DOWN() {
        return DOWN;
    }

    face(direction) {
        const vector = new Vector3(direction.x, direction.y, direction.z);

        this.body.lookAt(vector);
    }
}
