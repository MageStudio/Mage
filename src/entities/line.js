import Entity from './Entity';
import Scene from '../base/Scene';

import {
    LineBasicMaterial,
    Geometry,
    Line as THREELine,
    Vector3
} from 'three';

export default class Line extends Entity {

	constructor(points, options = {}) {
		super(options);

        const color = options.color || 0xffffff;
        this.material = new LineBasicMaterial({ color });
		this.geometry = new Geometry();

        points.forEach(p => {
            this.geometry.vertices.push(new Vector3(p.x, p.y, p.z));
        });

		this.mesh = new THREELine(this.geometry, this.material);

		const { addUniverse = true } = options;

		Scene.add(this.mesh, this, addUniverse);
	}

    updatePoints = (points) => {
        const vectors = points.map(({ x, y, z }) => new Vector3(x, y, z));
        this.mesh.geometry.vertices = vectors;
        this.mesh.geometry.verticesNeedUpdate = true;
    }

	toJSON() {
		return {
			mesh: this.mesh.toJSON(),
			script: this.script && this.script.toJSON(),
			texture: this.texture
		}
	}
}
