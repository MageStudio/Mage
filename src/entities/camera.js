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

	getPosition() {
		return {
			x: this.object.position.x,
			y: this.object.position.y,
			z: this.object.position.z
		};
	}

	setPosition(where) {
		const position = {
			...this.getPosition(),
			...where
		};

		if (this.object) {
			this.object.position.set(position.x, position.y, position.z);
		}
	}

	getRotation() {
		return {
			x: this.object.rotation.x,
			y: this.object.rotation.y,
			z: this.object.rotation.z
		};
	}

	setRotation(how) {
		const rotation = {
			...this.getRotation(),
			...how
		};

		if (this.object) {
			this.object.rotation.set(rotation.x, rotation.y, rotation.z);
		}
	}

	lookAt(x, y, z) {
		if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
			this.object.lookAt(x, y, z);
		}
	}
}
