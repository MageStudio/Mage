import Entity from './Entity';
import Universe from '../base/Universe';

export default class Mesh extends Entity {

	constructor(geometry, material, options) {
		super();
		this.geometry = geometry;
		this.material = material;
		this.script = {};
		this.hasScript = false;

		this.mesh = new THREE.Mesh(geometry, material);
		if (app.util.cast_shadow) {
			this.mesh.castShadow = true;
			this.mesh.receiveShadow = true;
		}
		//adding to core
		Universe.add(this.mesh, this);

		if (options) {
			//do something with options
			for (var o in options) {
				this[o] = options[o];
				if (o == "script") {
					this.hasScript = true;
					this.addScript(options[o], options.dir);
				}
			}
		}
	}

	texture(texture) {
		if (texture && this.mesh && this.mesh.material) {
			texture.wrapS = THREE.RepeatWrapping;
			texture.wrapT = THREE.RepeatWrapping;

			texture.repeat.set(1, 1);
			this.mesh.material.map = texture;
		}
	}
}
