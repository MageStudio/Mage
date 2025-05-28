import { SphereGeometry, MeshBasicMaterial } from "three";
import Element from "../Element";
import { ENTITY_TYPES } from "../constants";
import Color from "../../lib/Color";

export default class Sphere extends Element {
    constructor(radius = 10, color = Color.randomColor(true), options = {}) {
        super({
            radius,
            color,
            ...options,
        });

        this.radius = radius;
        this.color = color;

        const segments = 32;

        const geometry = new SphereGeometry(radius, segments, segments);
        const material = new MeshBasicMaterial({
            color,
            wireframe: false,
            ...options,
        });

        this.setBody({ geometry, material });
        this.setEntityType(ENTITY_TYPES.MESH.TYPE);
        this.setEntitySubtype(ENTITY_TYPES.MESH.SUBTYPES.SPHERE);
    }

    toJSON(parseJSON = false) {
        if (this.isSerializable()) {
            return {
                ...super.toJSON(parseJSON),
                radius: this.radius,
                color: this.color,
            };
        }
    }

    static create(data = {}) {
        return new Sphere(data.radius, data.color, data.options);
    }
}
