import Mesh from '../Mesh';
import {
    CubeGeometry,
    MeshBasicMaterial
} from 'three';

export default class Cube {

    constructor(side = 10, color, options = {}) {
        this.geometry = new CubeGeometry(side, side, side);
		this.material = new MeshBasicMaterial({
			color: color,
			wireframe: false,
            ...options
		});

		this.mesh = new Mesh(this.geometry, this.material, options);

        return this.mesh;
    }
}
