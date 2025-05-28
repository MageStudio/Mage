import { BoxGeometry, MeshBasicMaterial } from "three";
import Element from "../Element";
import { ENTITY_TYPES } from "../constants";
import Color from "../../lib/Color";

export default class Cube extends Element {
    constructor(size = 10, color = Color.randomColor(true), options = {}) {
        const geometry = new BoxGeometry(size, size, size);
        const material = new MeshBasicMaterial({
            color,
            wireframe: false,
            ...options,
        });

        super({
            size,
            color,
            ...options,
        });

        this.setBody({ geometry, material });
        this.setEntityType(ENTITY_TYPES.MESH.TYPE);
        this.setEntitySubtype(ENTITY_TYPES.MESH.SUBTYPES.CUBE);
    }

    static create(data = {}) {
        return new Cube(data.size, data.color);
    }
}
