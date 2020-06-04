import {
    CubeGeometry,
    MeshBasicMaterial
} from 'three';
import { BaseMesh, ENTITY_TYPES } from '../index';

export default class Cube extends BaseMesh {

    constructor(side = 10, color, options = {}) {
        super(null, null, options);

        const geometry = new CubeGeometry(side, side, side);
		const material = new MeshBasicMaterial({
			color: color,
			wireframe: false,
            ...options
        });
        
        this.setMesh({ geometry, material });
        this.setEntityType(ENTITY_TYPES.MESH);
    }
}
