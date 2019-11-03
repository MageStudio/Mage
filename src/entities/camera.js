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

	position(options) {
		const _x = options.x || this.object.position.x,
			_y = options.y || this.object.position.y,
			_z = options.z || this.object.position.z;

		if (this.object) {
			this.object.position.set(_x, _y, _z);
		}
	}

	rotation(options) {
		const _x = options.x || this.object.rotation.x,
			_y = options.y || this.object.rotation.y,
			_z = options.z || this.object.rotation.z;

		if (this.object) {
			this.object.rotation.set(_x, _y, _z);
		}
	}

	lookAt(x, y, z) {
		if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
			this.object.lookAt(x, y, z);
		}
	}
}
