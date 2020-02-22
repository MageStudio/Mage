import Entity from './Entity';
import Line from './Line';
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
import { DOWN, UP } from '../lib/constants';

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

		this.mesh.geometry.computeBoundingBox();
		this.boundingBox = this.mesh.geometry.boundingBox;

		this.rayColliders = [];

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
		if (this.hasRayColliders()) {
			this.updateRayColliders();
		}
	}

	add(mesh) {
		if (this.mesh) {
			this.mesh.add(mesh.mesh);
		}
	}

	hasRayColliders = () => this.rayColliders.length > 0;z

	updateRayColliders = () => {
		this.rayColliders.forEach(({ rayCollider, helper }) => {

			rayCollider.ray.origin.copy(this.mesh.position);

			if (helper) {
				helper.updatePoints(this.getPointsFromRayCollider(rayCollider));
			}
		});
	};

	getPointsFromRayCollider = (rayCollider) => {
		const origin = this.mesh.position.clone();
		const end = origin.add(rayCollider.ray.direction.clone().multiplyScalar(rayCollider.far));
		//rayCollider.ray.direction.clone().multiplyScalar(rayCollider.far);

		return [origin, end];
	}

	createColliderHelper = (rayCollider) => new Line(this.getPointsFromRayCollider(rayCollider));

	createRayColliderFromVector = ({ type, vector }, near, far, debug) => {

		const position = this.mesh.position.clone();
		const rayCollider = new Raycaster(position, vector, near, far);
		const helper = debug && this.createColliderHelper(rayCollider);

		return {
			type,
			rayCollider,
			helper
		};
	}

	setRayColliders = (vectors = [], options = {}) => {
		const { near = 0, far = 10, debug = false } = options;

		this.rayColliders = [
			...this.rayColliders,
			...vectors.map((v) => this.createRayColliderFromVector(v, near, far, debug))
		];
	};

	checkCollisions = () => {
		const collisions = [];
		this.rayColliders.forEach(({ type, rayCollider }) => {
			const intersections = rayCollider.intersectObjects(SceneManager.scene.children);
			if (intersections.length > 0) {
				collisions.push(type);
			}
		});

		return collisions;
	};

	isOnObject() {
		const intersections = this.raycaster.intersectObjects(SceneManager.scene.children);
		return intersections.length > 0;
	}

	setTextureMap(textureId, options = {}) {
		if (textureId && this.mesh && this.mesh.material) {
			const {
				repeat = { x: 1, y: 1 },
				wrap = RepeatWrapping
			} = options;
			const texture = ImagesEngine.get(textureId);

			this.texture = textureId;

			texture.wrapS = wrap;
			texture.wrapT = wrap;
			texture.repeat.set(repeat.x, repeat.y);

			this.mesh.material.map = texture;
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
