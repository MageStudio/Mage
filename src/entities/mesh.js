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
	Color
} from 'three';
import { COLLISION_EVENT } from '../lib/constants';
import universe from '../base/universe';

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

		this.colliders = [];
		this.collisionsEnabled = true;
		this.children = [];

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
		if (this.hasRayColliders() && this.areCollisionsEnabled()) {
			this.updateRayColliders();
			this.checkCollisions();
		}
	}

	add(mesh) {
		if (this.mesh) {
			this.children.push(mesh);
			this.mesh.add(mesh.mesh);
		}
	}

	getChildByName(name) {
		return this.children.filter((child) =>
			child.name === name
		)[0];
	}

	hasRayColliders = () => this.colliders.length > 0;

	areCollisionsEnabled = () => this.collisionsEnabled;

	enableCollisions = () => this.collisionsEnabled = true;
	disableCollisions = () => this.collisionsEnabled = false;

	updateRayColliders = () => {
		this.colliders.forEach(({ ray, helper }) => {

			ray.ray.origin.copy(this.mesh.position);

			if (helper) {
				helper.updatePoints(this.getPointsFromRayCollider(ray));
			}
		});
	};

	getPointsFromRayCollider = (ray) => {
		const origin = this.mesh.position.clone();
		const end = origin.add(ray.ray.direction.clone().multiplyScalar(ray.far));
		//ray.ray.direction.clone().multiplyScalar(ray.far);

		return [origin, end];
	};

	createColliderHelper = (ray) => new Line(this.getPointsFromRayCollider(ray));

	createRayColliderFromVector = ({ type, vector }, near, far, debug) => {

		const position = this.mesh.position.clone();
		const ray = new Raycaster(position, vector, near, far);
		const helper = debug && this.createColliderHelper(ray);

		return {
			type,
			ray,
			helper
		};
	};

	setColliders = (vectors = [], options = {}) => {
		const { near = 0, far = 10, debug = false } = options;

		this.colliders = [
			...this.colliders,
			...vectors.map((v) => this.createRayColliderFromVector(v, near, far, debug))
		];
	};

	mapIntersectionToMesh(mesh) {
		const uuid = mesh.uuid;

		return universe.getByUUID(uuid);
	}

	checkRayCollider = ({ ray, type }) => {
		const intersections = ray.intersectObjects(SceneManager.scene.children);
		if (intersections.length > 0) {
			return {
				meshes: intersections.map(this.mapIntersectionToMesh),
				type
			};
		} else {
			return {
				meshes: [],
				type
			}
		}
	};

	checkCollisions = () => {
		const collisions = [];
		this.colliders.forEach((collider) => {
			const collision = this.checkRayCollider(collider);

			if (collision) {
				collisions.push(collision);
			}
		});

		if (collisions.length) {
			this.dispatchEvent({
				type: COLLISION_EVENT,
				collisions
			});
		}

		return collisions;
	};

	isCollidingOnDirection(direction) {
		const collider = this.colliders.filter(({ type }) => type === direction)[0];

		if (collider) {
			return this.checkRayCollider(collider);
		}

		return {
			meshes: [],
			type: direction
		};
	}

	setColor(color) {
		if (color && this.mesh.material.color) {
			this.mesh.material.color = new Color(color);
		}
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

	setOpacity(value = 1.0) {
		this.mesh.material.transparent = true;
		this.mesh.material.opacity = value;
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
