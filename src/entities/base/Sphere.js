import BaseMesh from '../BaseMesh';
import {
    SphereGeometry,
    MeshBasicMaterial
} from 'three';
import { ENTITY_TYPES } from '../BaseEntity';

export default class Sphere extends BaseMesh {

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
