import Mesh from '../entities/Mesh';
import {
	MeshLambertMaterial,
	ObjectLoader
} from 'three';

import GLTFLoader from '../loaders/GLTFLoader';
import AssetsManager from '../base/AssetsManager';

const EXTENSIONS = {
	JSON: 'json',
	GLTF: 'glb'
};

const FULL_STOP = '.';

const loaders = {
	[EXTENSIONS.JSON]: new ObjectLoader(),
	[EXTENSIONS.GLTF]: new GLTFLoader()
};

const extractExtension = (path) => path.split(FULL_STOP).slice(-1);
const getLoaderFromExtension = (extension) => loaders[extension] || new ObjectLoader();

const ModelsEngine = {
	map: {},
	getModel: (id, options = {}) => {
		const model = ModelsEngine.map[id] || false;

		if (model) {
			model.material.wireframe = false;
			const mesh = new Mesh(model.geometry, model.material, options);
			mesh.setModel();

			return mesh;
		}
		return false;
	},
	loadModels: () => {
		const keys = Object.keys(AssetsManager.models());

		if (!keys.length) {
			return Promise.resolve('models');
		}

		return Promise.all(keys.map(ModelsEngine.loadSingleFile));
	},
	loadSingleFile: (id) => {
		const path = AssetsManager.models()[id];
		const extension = extractExtension(path);
		const loader = getLoaderFromExtension(extension);

		return new Promise(resolve => {
			loader.load(path, model => {
				ModelsEngine.map[id] = model.scene.children[0] || model;
				resolve();
			});
		});
	}

}

export default ModelsEngine;
