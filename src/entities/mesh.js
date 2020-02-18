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
	MeshStandardMaterial,
	Raycaster,
	Vector3
} from 'three';

export default class Mesh extends Entity {

	constructor(geometry, material, options = {}) {
		super(options);

		const {
			addUniverse = true,
			name = `default_${Math.random()}`
		} = options;

		this.texture = undefined;
		this.options = options;
		this.geometry = geometry;
		this.material = material;
		this.mesh = new THREEMesh(this.geometry, this.material);
		this.raycaster = new Raycaster(new Vector3(), new Vector3(0, - 1, 0), 0, 10);

		this.setName(name);

		if (Config.lights().shadows) {
			this.mesh.castShadow = true;
			this.mesh.receiveShadow = true;
		}

		this.setMesh();
		SceneManager.add(this.mesh, this, addUniverse);
	}

	update(dt) {
		super.update(dt);
		this.raycaster.ray.origin.copy(this.mesh.position);
		this.raycaster.ray.origin.y -= 10;
	}

	isOnObject() {
		const intersections = this.raycaster.intersectObjects(SceneManager.scene.children);
		return intersections.length > 0;
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

	setMaterial(MeshMaterial, options = {}) {
		const material = new MeshMaterial({
			map: this.mesh.material.map,
			color: this.mesh.material.color,
			transparent: this.mesh.material.transparent,
			opacity: this.mesh.material.opacity,
			...options
		});

		this.mesh.material = material;
	}

	setWireframe(flag = true) {
		this.mesh.material.wireframe = flag;
	}

	toJSON() {
		if (this.serializable) {
			return {
				mesh: this.mesh.toJSON(),
				scripts: this.scripts && this.scripts.map(s => s.toJSON()),
				texture: this.texture,
				...this.options
			}
		}

	}
}
