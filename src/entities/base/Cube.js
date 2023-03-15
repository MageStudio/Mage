import { BoxGeometry, MeshBasicMaterial } from "three";
import Element from "../Element";
import { ENTITY_TYPES } from "../constants";
import Color from "../../lib/Color";

export default class Cube extends Element {
    constructor(side = 10, color = Color.randomColor(true), options = {}) {
        super(options);

        const geometry = new BoxGeometry(side, side, side);
        const material = new MeshBasicMaterial({
            color,
            wireframe: false,
            ...options,
        });

        this.setBody({ geometry, material });
        this.setEntityType(ENTITY_TYPES.MESH);
    }
}
