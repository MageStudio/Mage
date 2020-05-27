import BaseMesh from '../BaseMesh';
import { ENTITY_TYPES } from '../BaseEntity';

import {
    LineBasicMaterial,
    Geometry,
    Vector3
} from 'three';

export default class Line extends BaseMesh {

	constructor(points, options = {}) {
		super(null, null, options);

        const color = options.color || 0xffffff;
        const material = new LineBasicMaterial({ color });
		const geometry = new Geometry();

        points.forEach(p => {
            geometry.vertices.push(new Vector3(p.x, p.y, p.z));
        });

        this.setMesh({ geometry, material });
        this.setEntityType(ENTITY_TYPES.MESH);
	}

    updatePoints = (points) => {
        const vectors = points.map(({ x, y, z }) => new Vector3(x, y, z));
        this.mesh.geometry.vertices = vectors;
        this.mesh.geometry.verticesNeedUpdate = true;
    }
}