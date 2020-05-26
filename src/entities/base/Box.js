import BaseMesh from '../BaseMesh';
import {
    CubeGeometry,
    MeshBasicMaterial
} from 'three';

export default class Box {

    constructor(width = 10, height = 10, depth = 10, color, options = {}) {
        this.geometry = new CubeGeometry(width, height, depth);
		this.material = new MeshBasicMaterial({
			color: color,
			wireframe: false,
            ...options
		});

		this.mesh = new BaseMesh(this.geometry, this.material, options);

        return this.mesh;
    }
}
