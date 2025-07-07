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

        this.size = size;
        this.color = color;

        this.setBody({ geometry, material });
        this.setEntityType(ENTITY_TYPES.MESH.TYPE);
        this.setEntitySubtype(ENTITY_TYPES.MESH.SUBTYPES.CUBE);
    }

    toJSON(parseJSON = false) {
        if (this.isSerializable()) {
            return {
                ...super.toJSON(parseJSON),
                size: this.size,
                color: this.color,
            };
        }
    }

    static create(data = {}) {
        const { size, color, options } = data;

        return new Cube(size, color, options);
    }
}
