import Entity from './entity';
import { PerspectiveCamera } from 'three';

export default class Camera extends Entity {

	constructor(options) {
		const name = options.name || 'camera';
		super({ name });

		this.options = options;
		this.object = new PerspectiveCamera(
			options.fov,
			options.ratio,
			options.near,
			options.far
		);
	}

	get rotation() {
		return (this.object) ? {
			x: this.object.rotation.x,
			y: this.object.rotation.y,
			z: this.object.rotation.z
		} : {
			x: 1,
			y: 1,
			z: 1
		};
	}

	set rotation({ x, y, z }) {
		const rotation = {
			x: x === undefined ? this.object.rotation.x : x,
			y: y === undefined ? this.object.rotation.y : y,
			z: z === undefined ? this.object.rotation.z : z
		}

		if (this.object) {
			this.object.rotation.set(rotation.x, rotation.y, rotation.z);
		} else {
			console.warn('[Mage] Missing camera, cannot apply rotation.');
		}
	}

	get position() {
		return (this.object) ? {
			x: this.object.position.x,
			y: this.object.position.y,
			z: this.object.position.z
		} : {
			x: 1,
			y: 1,
			z: 1
		};
	}

	set position({ x, y, z }) {
		const position = {
			x: x === undefined ? this.object.position.x : x,
			y: y === undefined ? this.object.position.y : y,
			z: z === undefined ? this.object.position.z : z
		}

		if (this.object) {
			this.object.position.set(position.x, position.y, position.z);
		} else {
			console.warn('[Mage] Missing camera, cannot apply position.');
		}
	}

	lookAt(x, y, z) {
		if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
			this.object.lookAt(x, y, z);
		}
	}
}
