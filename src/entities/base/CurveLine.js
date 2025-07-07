import { Vector3, CatmullRomCurve3 } from "three";
import Line from "./Line";
import { ENTITY_TYPES } from "../constants";

const DEFAULT_CURVE_LINE_DIVISIONS = 20;

export default class CurveLine extends Line {
    constructor(points = [], options = {}) {
        const { divisions = DEFAULT_CURVE_LINE_DIVISIONS } = options;
        const curve = CurveLine.genereateCurve(points, divisions);

        super(curve, options);

        this.curve = curve;
        this.setEntitySubtype(ENTITY_TYPES.MESH.SUBTYPES.CURVE_LINE);
    }

    static genereateCurve(points, divisions) {
        return new CatmullRomCurve3(points.map(({ x, y, z }) => new Vector3(x, y, z))).getPoints(
            divisions,
        );
    }

    static create(data = {}) {
        return new CurveLine(data.points, data.options);
    }
}
