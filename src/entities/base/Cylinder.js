import { CylinderGeometry, MeshBasicMaterial } from "three";
import Element from "../Element";
import { ENTITY_TYPES } from "../constants";
import Color from "../../lib/Color";

export default class Cylinder extends Element {
    constructor(
        radiusTop = 10,
        radiusBottom = 10,
        height = 10,
        color = Color.randomColor(true),
        options = {},
    ) {
        super(options);

        const segments = 32;

        const geometry = new CylinderGeometry(radiusTop, radiusBottom, height, segments);
        const material = new MeshBasicMaterial({
            color,
            wireframe: false,
            ...options,
        });

        this.setBody({ geometry, material });
        this.setEntityType(ENTITY_TYPES.MESH);
    }
}
