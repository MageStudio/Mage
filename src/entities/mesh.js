import Entity from './Entity';
import Config from '../base/config';
import SceneManager from '../base/SceneManager';
import ImagesEngine from '../images/ImagesEngine';
import { Mesh as THREEMesh, RepeatWrapping, MeshBasicMaterial } from 'three';

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

	setTexture(textureid) {
		if (textureid &&
			this.texture !== textureid &&
			this.mesh && this.mesh.material) {

			const texture = ImagesEngine.get(textureid);

			this.texture = textureid;

			texture.wrapS = RepeatWrapping;
			texture.wrapT = RepeatWrapping;

			texture.repeat.set(1, 1);

			this.mesh.material.wireframe = false;
			this.mesh.material = new MeshBasicMaterial({ map: texture });
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
