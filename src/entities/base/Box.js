import BaseMesh from '../BaseMesh';
import {
    CubeGeometry,
    MeshBasicMaterial
} from 'three';
import { ENTITY_TYPES } from '../BaseEntity';

export default class Box extends BaseMesh {

    constructor(width = 10, height = 10, depth = 10, color, options = {}) {
        super(null, null, options);

        const geometry = new CubeGeometry(width, height, depth);
		const material = new MeshBasicMaterial({
			color: color,
			wireframe: false,
            ...options
		});

        this.setMesh({ geometry, material });
        this.setEntityType(ENTITY_TYPES.MESH);
    }
}
