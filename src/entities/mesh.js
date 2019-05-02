import Entity from './Entity';
import Config from '../base/config';
import SceneManager from '../base/SceneManager';
import ImagesEngine from '../images/ImagesEngine';
import {
	Mesh as THREEMesh,
	RepeatWrapping,
	MeshBasicMaterial,
	MeshLambertMaterial,
	MeshPhongMaterial,
	MeshDepthMaterial,
	MeshStandardMaterial
} from 'three';

export default class Mesh extends Entity {

	constructor(geometry, material, options) {
		super();

		this.script = undefined;
		this.texture = undefined;

		this.options = options;
		this.geometry = geometry;
		this.material = material;

		this.mesh = new THREEMesh(this.geometry, this.material);

		if (Config.lights().shadows) {
			this.mesh.castShadow = true;
			this.mesh.receiveShadow = true;
		}
		this.setMesh();
		SceneManager.add(this.mesh, this);

		console.log('created mesh inside constructor', this.mesh);
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

	setMaterialFromName(materialName) {
		switch(materialName) {
			case 'lambert':
				this.setMaterial(MeshLambertMaterial);
				break;
			case 'phong':
				this.setMaterial(MeshPhongMaterial);
				break;
			case 'depth':
				this.setMaterial(MeshDepthMaterial);
				break;
			case 'standard':
				this.setMaterial(MeshStandardMaterial);
				break;
			case 'basic':
			default:
				this.setMaterial(MeshBasicMaterial);
				break;
		}
	}

	setMaterial(MeshMaterial) {
		const material = new MeshMaterial({
			map: this.mesh.material.map,
			color: this.mesh.material.color
		});

		this.mesh.material = material;
	}

	toJSON() {
		return {
			mesh: this.mesh.toJSON(),
			script: this.script && this.script.toJSON(),
			texture: this.texture
		}
	}
}
