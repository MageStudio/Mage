import {
    ConeGeometry,
    MeshBasicMaterial
} from 'three';
import Color from '../../lib/Color';
import Element from '../Element';
import { ENTITY_TYPES }  from '../constants';

const DEFAULT_RADIUS = 5;
const DEFAULT_HEIGHT = 5;
const DEFAULT_RADIAL_SEGMENTS = 8;
const DEFAULT_HEIGHT_SEGMENTS = 1;
const DEFAULT_OPENENDED = false;

export default class Cone extends Element {

    constructor(radius = DEFAULT_RADIUS, height = DEFAULT_HEIGHT, color = Color.randomColor(true), options = {}) {
        super(options);

        const {
            radialSegments = DEFAULT_RADIAL_SEGMENTS,
            heightSegments = DEFAULT_HEIGHT_SEGMENTS,
            openEnded = DEFAULT_OPENENDED
        } = options;

        const geometry = new ConeGeometry(radius, height, radialSegments, heightSegments, openEnded);
        const material = new MeshBasicMaterial({
            color,
            wireframe: false,
            ...options
        });
        
        this.setBody({ geometry, material });
        this.setEntityType(ENTITY_TYPES.MESH);
    }
}
