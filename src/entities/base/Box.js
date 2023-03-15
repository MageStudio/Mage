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
        super(options);

        const geometry = new BoxGeometry(width, height, depth);
        const material = new MeshBasicMaterial({
            color,
            wireframe: false,
            ...options,
        });

        this.setBody({ geometry, material });
        this.setEntityType(ENTITY_TYPES.MESH);
    }
}
