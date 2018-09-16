import Entity from './entity';

export default class Camera extends Entity {

	constructor(options) {
		super();
		this.options = options;
		this.object = new THREE.PerspectiveCamera(options.fov, options.ratio , options.near, options.far );
		//adding to core
	}
}
