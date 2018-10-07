import Mesh from '../entities/Mesh';
import {
	MultiMaterial,
	MeshLambertMaterial,
	JSONLoader
} from 'three';

export class ModelsEngine {

	constructor(assetsManager) {
		this.loaders = JSONLoader(),
		this.numModels = 0;
		this.modelsLoaded = 0;
		this.assetsManager = assetsManager;
	}

	load() {
		this.map = {};
		this.models = [];
		const keys = Object.keys(Assets.Models);

		if (!keys.length) {
			return Promise.resolve('models');
		}

		return Promise.all(keys.map(this.loadSingleFile));
	}

	get(id) {
		var model = this.map[id] || false;
		if (model) {
			model.material.wireframe = false;
			return new Mesh(model.geometry, model.material);
		}
		return false;
	}

	loadSingleFile(id) {
		const path = Assets.Models[id];
		return new Promise(resolve => {
			this.loader.load(path, (geometry, materials) => {
	            var faceMaterial;
	            if (materials && materials.length > 0) {
	                var material = materials[0];
	                material.morphTargets = true;
	                faceMaterial = new MultiMaterial(materials);
	            } else {
	                faceMaterial = new MeshLambertMaterial({wireframe: true});
	            }

	            var model = {
					geometry,
					material: faceMaterial
				}

				this.map[id] = model;
				resolve();
	        });
		});
		// Load a sound file using an ArrayBuffer XMLHttpRequest.

	}

	add(model) {
		this.models.push(model);
	}
}

export default new ModelsEngine();
