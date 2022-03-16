
import { Vector3, CatmullRomCurve3 } from 'three';
import Line from './Line';

const DEFAULT_CURVE_LINE_DIVISIONS = 20;

export default class CurveLine extends Line {

    constructor(points = [], options = {}) {
        const {
            divisions = DEFAULT_CURVE_LINE_DIVISIONS
        } = options;
        const curve = CurveLine.genereateCurve(points, divisions);

        super(curve, options);

        this.curve = curve;
    }

    static genereateCurve(points, divisions) {
        return new CatmullRomCurve3(
            points.map(({ x, y, z }) => new Vector3(x, y, z)) 
        ).getPoints(divisions);
    }
};