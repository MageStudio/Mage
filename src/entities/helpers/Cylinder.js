import SceneHelper from '../../base/SceneManager';
import Mesh from '../Mesh';
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

		this.mesh = new Mesh(this.geometry, this.material);

        return this.mesh;
    }
}
