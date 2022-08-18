import {
    ConeGeometry,
    MeshBasicMaterial
} from 'three';
import Element from '../Element';
import { ENTITY_TYPES }  from '../constants';

export default class Cone extends Element {

    constructor(radius = 5, height = 5, color, options = {}) {
        super(options);

        const {
            radialSegments = 8,
            heightSegments = 1,
            openEnded = false
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
