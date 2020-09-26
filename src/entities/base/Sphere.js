import {
    SphereGeometry,
    MeshBasicMaterial
} from 'three';
import { Element, ENTITY_TYPES } from '../index';

export default class Sphere extends Element {

    constructor(radius = 10, color, options = {}) {
        super(null, null, options);

        const segments = 32;
        
        const geometry = new SphereGeometry(radius, segments, segments);
		const material = new MeshBasicMaterial({
			color: color,
			wireframe: false,
            ...options
		});

        this.setMesh({ geometry, material });
        this.setEntityType(ENTITY_TYPES.MESH);
    }
}
