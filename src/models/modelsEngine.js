import Mesh from '../entities/Mesh';

export default class ModelsEngine {

	constructor(assetsManager) {
		this.loaders = THREE.JSONLoader(),
		this.numModels = 0;
		this.modelsLoaded = 0;
		this.assetsManager = assetsManager;
	}

	load() {
		this.map = {};
		this.models = [];

		for (var model in Assets.Models) {
			this.numModels++;
			this.loadSingleFile(model, Assets.Models[model]);
		}

		if (this.numModels == 0) {
			this.assetsManager.completed.models = true;
		}
	}

	get(id) {
		var model = this.map[id] || false;
		if (model) {
			model.material.wireframe = false;
			return new Mesh(model.geometry, model.material);
		}
		return false;
	}

	loadSingleFile(id, path) {
		// Load a sound file using an ArrayBuffer XMLHttpRequest.
		this.loader.load(path, function(geometry, materials) {
            var faceMaterial;
            if (materials && materials.length > 0) {
                var material = materials[0];
                material.morphTargets = true;
                faceMaterial = new THREE.MultiMaterial(materials);
            } else {
                faceMaterial = new THREE.MeshLambertMaterial({wireframe: true});
            }

            var model = {
				geometry: geometry,
				material: faceMaterial
			}

			this.map[id] = model;
			this.modelsLoaded++;
			this.checkLoad();
        });
	}

	checkLoad() {
		if (this.modelsLoaded == this.numModels) {
			this.assetsManager.completed.models = true;
		}
	}

	add(model) {
		this.models.push(model);
	}
}
