import Mesh from '../entities/Mesh';
import {
	MeshLambertMaterial,
	ObjectLoader
} from 'three';

import AssetsManager from '../base/AssetsManager';

export class ModelsEngine {

	constructor() {
		// this.loadingManager = new LoadingManager(this.onLoad, this.onProgress, this.onError);
		this.loader = new ObjectLoader();
		this.numModels = 0;
		this.modelsLoaded = 0;
	}

	onLoad() {}
	onProgress() {}
	onError() {}

	load = () => {
		this.map = {};
		this.models = [];

		const keys = Object.keys(AssetsManager.models());

		if (!keys.length) {
			return Promise.resolve('models');
		}

		return Promise.all(keys.map(this.loadSingleFile));
	};

	set = (id, model) => {
		this.map[id] = model;
	};

	get(id) {
		const model = this.map[id] || false;
		if (model) {
			model.material.wireframe = false;
			const mesh = new Mesh(model.geometry, model.material);
			mesh.setModel();

			return mesh;
		}
		return false;
	}

	parseModel = (json) => {
		const defaultMaterial = new MeshLambertMaterial({wireframe: true});
		const { geometry, material = defaultMaterial} = this.loader.parse(json);

		return new Mesh(geometry, material);
	}

	loadSingleFile = (id) => {
		const path = AssetsManager.models()[id];
		return new Promise(resolve => {
			// this.loader.load(path, (geometry, materials) => {
	        //     var faceMaterial;
	        //     if (materials && materials.length > 0) {
	        //         var material = materials[0];
	        //         material.morphTargets = true;
	        //         faceMaterial = new MultiMaterial(materials);
	        //     } else {
	        //         faceMaterial = new MeshLambertMaterial({wireframe: true});
	        //     }
			//
	        //     var model = {
			// 		geometry,
			// 		material: faceMaterial
			// 	}
			//
			// 	this.map[id] = model;
			// 	resolve();
	        // });
			this.loader.load(path, model => {
				this.set(id, model);
				resolve();
			});
		});
	}

	add(model) {
		this.models.push(model);
	}
}

export default new ModelsEngine();
