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
        const segments = 32;

        super({
            radiusTop,
            radiusBottom,
            height,
            color,
            ...options,
        });

        this.radiusTop = radiusTop;
        this.radiusBottom = radiusBottom;
        this.height = height;
        this.color = color;

        const geometry = new CylinderGeometry(radiusTop, radiusBottom, height, segments);
        const material = new MeshBasicMaterial({
            color,
            wireframe: false,
            ...options,
        });

        this.setBody({ geometry, material });
        this.setEntityType(ENTITY_TYPES.MESH.TYPE);
        this.setEntitySubtype(ENTITY_TYPES.MESH.SUBTYPES.CYLINDER);
    }

    toJSON(parseJSON = false) {
        if (this.isSerializable()) {
            return {
                ...super.toJSON(parseJSON),
                radiusTop: this.radiusTop,
                radiusBottom: this.radiusBottom,
                height: this.height,
                color: this.color,
            };
        }
    }

    static create(data = {}) {
        const { radiusTop, radiusBottom, height, color, options } = data;

        return new Cylinder(radiusTop, radiusBottom, height, color, options);
    }
}
