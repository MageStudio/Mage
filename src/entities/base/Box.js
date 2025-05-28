import { BoxGeometry, MeshBasicMaterial } from "three";
import Element from "../Element";
import { ENTITY_TYPES } from "../constants";
import Color from "../../lib/Color";

export default class Box extends Element {
    constructor(
        width = 10,
        height = 10,
        depth = 10,
        color = Color.randomColor(true),
        options = {},
    ) {
        super({
            width,
            height,
            depth,
            color,
            ...options,
        });

        this.width = width;
        this.height = height;
        this.depth = depth;
        this.color = color;

        const geometry = new BoxGeometry(width, height, depth);
        const material = new MeshBasicMaterial({
            color,
            wireframe: false,
            ...options,
        });

        this.setBody({ geometry, material });
        this.setEntityType(ENTITY_TYPES.MESH.TYPE);
        this.setEntitySubtype(ENTITY_TYPES.MESH.SUBTYPES.BOX);
    }

    toJSON(parseJSON = false) {
        if (this.isSerializable()) {
            return {
                ...super.toJSON(parseJSON),
                width: this.width,
                height: this.height,
                depth: this.depth,
                color: this.color,
            };
        }
    }
}
