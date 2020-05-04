import Mesh from '../Mesh';
import {
    SphereGeometry,
    MeshBasicMaterial
} from 'three';

export default class Sphere {

    constructor(radius = 10, color, options = {}) {
        const segments = 32;
        
        this.geometry = new SphereGeometry(radius, segments, segments);
		this.material = new MeshBasicMaterial({
			color: color,
			wireframe: false,
            ...options
		});

		this.mesh = new Mesh(this.geometry, this.material, options);

        return this.mesh;
    }
}
