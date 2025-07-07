import Element from "../Element";
import { ENTITY_TYPES } from "../constants";

import {
    LineBasicMaterial,
    LineDashedMaterial,
    BufferGeometry,
    Line as THREELine,
    Vector3,
} from "three";

const DEFAULT_LINE_COLOR = 0xffffff;
const DEFAULT_LINE_THICKNESS = 2;

export default class Line extends Element {
    constructor(points = [], options = {}) {
        super({
            points,
            ...options,
        });

        this.points = points;

        const material = this.buildMaterial();
        const geometry = this.getGeometryFromPoints();
        const body = new THREELine(geometry, material);

        this.setBody({ body });
        this.setEntityType(ENTITY_TYPES.MESH.TYPE);
        this.setEntitySubType(ENTITY_TYPES.MESH.SUBTYPES.LINE);
    }

    postBodyCreation() {
        super.postBodyCreation();
        const { dashed = false } = this.options;

        if (dashed) {
            this.body.computeLineDistances();
        }
    }

    buildMaterial() {
        const {
            color = DEFAULT_LINE_COLOR,
            dashed = false,
            thickness = DEFAULT_LINE_THICKNESS,
        } = this.options;

        return dashed
            ? new LineDashedMaterial({ color, linewidth: thickness })
            : new LineBasicMaterial({ color, linewidth: thickness });
    }

    getGeometryFromPoints() {
        const vectors = this.points.map(({ x = 0, y = 0, z = 0 }) => new Vector3(x, y, z));

        return new BufferGeometry().setFromPoints(vectors);
    }

    updatePoints = points => {
        const vectors = points.map(({ x, y, z }) => new Vector3(x, y, z));
        this.body.geometry.vertices = vectors;
        this.body.geometry.verticesNeedUpdate = true;
    };

    setThickness(thickness = DEFAULT_LINE_THICKNESS) {
        this.body.material.linewidth = thickness;
    }

    toJSON(parseJSON = false) {
        if (this.isSerializable()) {
            return {
                ...super.toJSON(parseJSON),
                points: this.points,
            };
        }
    }

    static create(data = {}) {
        return new Line(data.points, data.options);
    }
}
