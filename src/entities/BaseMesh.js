import {
	Mesh,
	RepeatWrapping,
	MeshBasicMaterial,
	MeshLambertMaterial,
	MeshPhongMaterial,
	MeshDepthMaterial,
	MeshStandardMaterial,
	Raycaster,
	Color
} from 'three';
import BaseEntity, { ENTITY_TYPES } from './baseEntity';

import { MESH_NOT_SET, ANIMATION_HANDLER_NOT_FOUND } from '../lib/messages';
import Images from '../images/Images';
import AnimationHandler from './animations/AnimationHandler';
//import Line from './base/Line';
import Config from '../core/config';
import Scene from '../core/Scene';
import { COLLISION_EVENT, FRONT } from '../lib/constants';
import Universe from '../core/Universe';
import Physics from '../physics/physics';
import { getDescriptionForMesh } from '../physics/utils';
//import Box from './base/Box';

const BOUNDING_BOX_COLOR = 0Xf368e0;
const BOUNDING_BOX_INCREASE = .5;

export default class BaseMesh extends BaseEntity {

	constructor(geometry, material, options = {}) {
		super(options);

		const {
			name = `default_${Math.random()}`
		} = options;

		this.texture = undefined;
		this.options = options;

		this.setMesh({ geometry, material });

		this.colliders = [];
		this.collisionsEnabled = true;
		this.children = [];

		this.animationHandler = undefined;

		this.setName(name);
		this.setEntityType(ENTITY_TYPES.MESH);
	}

	hasMesh() {
		return !!this.mesh;
	}

	getMesh() {
		return this.mesh;
	}

	setMesh({ mesh, geometry, material }) {
		if (mesh) {
			this.mesh = mesh;
		} else if (geometry && material) {
			this.geometry = geometry;
			this.material = material;
			this.mesh = new Mesh(this.geometry, this.material);
		}

		if (this.hasMesh()) {
			this.postMeshCreation();
			this.addToScene();
		}
	}

	evaluateBoundingBox() {
		if (this.mesh.geometry) {
			this.mesh.geometry.computeBoundingBox();
			this.boundingBox = this.mesh.geometry.boundingBox;
		} else {
			this.mesh.children.forEach(child => {
				if (child.geometry) {
					child.geometry.computeBoundingBox();
					this.boundingBox = child.geometry.boundingBox;
					return;
				}
			})
		}
	}

	postMeshCreation() {
		this.evaluateBoundingBox();

		if (Config.lights().shadows) {
			this.mesh.castShadow = true;
			this.mesh.receiveShadow = true;
		}
	}

	addToScene() {
		const {
			addUniverse = true,
		} = this.options;

		if (this.hasMesh()) {
			console.log('adding to uni', this.name, this.getMesh());
			Scene.add(this.getMesh(), this, addUniverse);
		} else {
			console.warn(MESH_NOT_SET);
		}
	}

	setName(name, { replace = false } = {}) {
		super.setName(name);

		if (this.hasMesh()) {
			if (replace) this.dispose();

			this.mesh.name = name;

			if (replace) Scene.add(this.mesh, this, true);
		}
	}

	setArmature(armature) {
		this.armature = armature;

		Scene.add(this.armature, null, false);
	}

	addAnimationHandler(animations) {
		this.animationHandler = new AnimationHandler(this.getMesh(), animations);
	}

	hasAnimationHandler() {
		return !!this.animationHandler;
	}

	playAnimation(id) {
		if (this.hasAnimationHandler()) {
			this.animationHandler.playAnimation(id);
		} else {
			console.warn(ANIMATION_HANDLER_NOT_FOUND);
		}
	}

	enablePhysics(options) {
		if (Config.physics().enabled) {
			const description = {
                ...getDescriptionForMesh(this),
                ...options
			};

			if (options.debug) {
				this.addPhysicsBoundingBox(description);
			}
			
			Physics.add(this, description);
		}
	}

	addPhysicsBoundingBox({ rot, pos, size }) {
		const scaledSize = size.map(s => s + BOUNDING_BOX_INCREASE);
		const box = new Box(scaledSize[0], scaledSize[1], scaledSize[2], BOUNDING_BOX_COLOR);

		box.setPosition({ x: pos[0], y: pos[1], z: pos[2] });
		box.setRotation({ x: rot[0], y: rot[1], z: rot[2] });
		box.setWireframe(true);
		box.setWireframeLineWidth(2);

		this.add(box);
	}

	applyForce(force) {
		if (Config.physics().enabled) {
			Physics.applyForce(this.uuid(), force);
		}
	}

	update(dt) {
		super.update(dt);
		
		if (this.hasRayColliders() && this.areCollisionsEnabled()) {
			this.updateRayColliders();
			this.checkCollisions();
		}

		if (this.hasAnimationHandler()) {
			this.animationHandler.update(dt);
		}
	}

	add(what) {
		if (this.mesh) {
			const _add = (mesh) => {
				this.children.push(mesh);
				this.mesh.add(mesh.mesh);
			};

			if (Array.isArray(what)) {
				what.forEach(_add);
			} else {
				_add(what);
			}
		}
	}

	remove(what) {
		if (this.mesh) {
			this.mesh.remove(what.mesh);
			const index = this.children.findIndex(m => m.equals(what));

			this.children.splice(index, 1);
		}
	}

	getChildByName(name, options = {}) {
		const { recursive = false } = options;
		const find = () => this.children.filter(mesh => mesh.name === name)[0];

		if (recursive) {
			const mesh = find() || null;
			return mesh ? mesh : this.children.map((c) => c.getChild(name))[0];
		}

		return find();
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

	setColliders = (vectors = [], options = []) => {
		const colliders = vectors.map((vector, i) => {
			const { near = 0, far = 10, debug = false } = options[i];
			return this.createRayColliderFromVector(vector, near, far, debug)
		});

		this.colliders = [
			...this.colliders,
			...colliders
		];
	};

	checkRayCollider = ({ ray, type }) => {
		const intersections = ray
			.intersectObjects(Scene.scene.children)
			.filter(collision => collision.object.uuid !== this.uuid());

		const mapCollision = (collision) => {
			const { distance, object } = collision;
			const { uuid } = object;

			return {
				distance,
				mesh: Universe.getByUUID(uuid)
			};
		}

		return {
			collisions: intersections.length ? intersections.map(mapCollision) : [],
			type
		};
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
		const emptyCollision = {
			collisions: [],
			type: direction
		};

		return collider ?
			this.checkRayCollider(collider) :
			emptyCollision;
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
			const texture = Images.get(textureId);

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

	setWireframeLineWidth(width = 1) {
		this.mesh.material.wireframeLinewidth = width;
	}

	copyQuaternion = (quaternion) => {
		this.mesh.quaternion.copy(quaternion);
	}

	copyPosition = (position) => {
		this.mesh.position.copy(position);
	}

	equals = (object) => (
		this.name === object.name &&
		this.mesh.uuid === object.mesh.uuid
	);

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
