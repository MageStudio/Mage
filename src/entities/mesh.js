import Entity from './Entity';
import Config from '../base/config';
import SceneManager from '../base/SceneManager';
import { Mesh as THREEMesh, RepeatWrapping } from 'three';

export default class Mesh extends Entity {

	constructor(geometry, material, options) {
		super();
		this.geometry = geometry;
		this.material = material;
		this.script = {};
		this.hasScript = false;

		this.mesh = new THREEMesh(geometry, material);
		if (Config.lights().shadows) {
			this.mesh.castShadow = true;
			this.mesh.receiveShadow = true;
		}
		this.setMesh();
		//adding to core
		SceneManager.add(this.mesh, this);

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
			texture.wrapS = RepeatWrapping;
			texture.wrapT = RepeatWrapping;

			texture.repeat.set(1, 1);
			this.mesh.material.map = texture;
		}
	}
}
