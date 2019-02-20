import Entity from './Entity';
import Config from '../base/config';
import SceneManager from '../base/SceneManager';
import { Mesh as THREEMesh, RepeatWrapping } from 'three';

export default class Mesh extends Entity {

	constructor(geometry, material, options) {
		super();

		this.script = undefined;
		this.texture = undefined;

		this.geometry = geometry;
		this.material = material;

		this.mesh = new THREEMesh(geometry, material);

		if (Config.lights().shadows) {
			this.mesh.castShadow = true;
			this.mesh.receiveShadow = true;
		}
		this.setMesh();
		SceneManager.add(this.mesh, this);
	}

	setTexture(texture) {
		if (texture && this.mesh && this.mesh.material) {
			this.texture = texture;
			texture.wrapS = RepeatWrapping;
			texture.wrapT = RepeatWrapping;

			texture.repeat.set(1, 1);
			this.mesh.material.map = texture;
		}
	}

	toJSON() {
		return {
			mesh: this.mesh.toJSON(),
			script: this.script && this.script.toJSON(),
			texture: this.texture
		}
	}
}
