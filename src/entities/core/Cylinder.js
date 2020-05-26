import BaseMesh from '../BaseMesh';
import {
    CylinderGeometry,
    MeshBasicMaterial
} from 'three';

export default class Cylinder {

    constructor(radiusTop = 10, radiusBottom = 10, height, color, options = {}) {
        const segments = 32;

        this.geometry = new CylinderGeometry(radiusTop, radiusBottom, height, segments );
		this.material = new MeshBasicMaterial({
			color: color,
			wireframe: false,
            ...options
		});

		this.mesh = new BaseMesh(this.geometry, this.material, options);

        return this.mesh;
    }
}
