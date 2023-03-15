import { SphereGeometry, MeshBasicMaterial } from "three";
import Element from "../Element";
import { ENTITY_TYPES } from "../constants";
import Color from "../../lib/Color";

export default class Sphere extends Element {
    constructor(radius = 10, color = Color.randomColor(true), options = {}) {
        super(options);

        const segments = 32;

        const geometry = new SphereGeometry(radius, segments, segments);
        const material = new MeshBasicMaterial({
            color,
            wireframe: false,
            ...options,
        });

        this.setBody({ geometry, material });
        this.setEntityType(ENTITY_TYPES.MESH);
    }
}
