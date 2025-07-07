import { ConeGeometry, MeshBasicMaterial } from "three";
import Color from "../../lib/Color";
import Element from "../Element";
import { ENTITY_TYPES } from "../constants";

const DEFAULT_RADIUS = 5;
const DEFAULT_HEIGHT = 5;
const DEFAULT_RADIAL_SEGMENTS = 8;
const DEFAULT_HEIGHT_SEGMENTS = 1;
const DEFAULT_OPENENDED = false;

const DEFAULT_OPTIONS = {
    radialSegments: DEFAULT_RADIAL_SEGMENTS,
    heightSegments: DEFAULT_HEIGHT_SEGMENTS,
    openEnded: DEFAULT_OPENENDED,
};

export default class Cone extends Element {
    constructor(
        radius = DEFAULT_RADIUS,
        height = DEFAULT_HEIGHT,
        color = Color.randomColor(true),
        options = {},
    ) {
        super({
            ...DEFAULT_OPTIONS,
            radius,
            height,
            color,
            ...options,
        });

        this.radius = radius;
        this.height = height;
        this.color = color;

        const { radialSegments, heightSegments, openEnded } = this.options;

        const geometry = new ConeGeometry(
            radius,
            height,
            radialSegments,
            heightSegments,
            openEnded,
        );
        const material = new MeshBasicMaterial({
            color,
            wireframe: false,
            ...options,
        });

        this.setBody({ geometry, material });
        this.setEntityType(ENTITY_TYPES.MESH.TYPE);
        this.setEntitySubtype(ENTITY_TYPES.MESH.SUBTYPES.CONE);
    }

    toJSON(parseJSON = false) {
        if (this.isSerializable()) {
            return {
                ...super.toJSON(parseJSON),
                radius: this.radius,
                height: this.height,
                color: this.color,
            };
        }
    }

    static create(data = {}) {
        const { radius, height, color, options } = data;

        return new Cone(radius, height, color, options);
    }
}
