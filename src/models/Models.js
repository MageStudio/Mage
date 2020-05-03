import Mesh from '../entities/Mesh';
import {
	MeshLambertMaterial,
	ObjectLoader
} from 'three';

import GLTFLoader from '../loaders/GLTFLoader';

const EXTENSIONS = {
	JSON: 'json',
	GLB: 'glb',
	GLTF: 'gltf'
};

const FULL_STOP = '.';

const loaders = {
	[EXTENSIONS.JSON]: new ObjectLoader(),
	[EXTENSIONS.GLB]: new GLTFLoader(),
	[EXTENSIONS.GLTF]: new GLTFLoader()
};

const extractExtension = (path) => path.split(FULL_STOP).slice(-1);
const getLoaderFromExtension = (extension) => loaders[extension] || new ObjectLoader();

const gltfParser = (gltf) => {
	let mesh;
	gltf.scene.traverse(m => {
		if (m.isMesh) {
			mesh = m;
		}
	});

	return mesh;
}
const glbParser = (glb) => glb.scene.children[0];
const defaultParser = m => m;

const parsers = {
	[EXTENSIONS.JSON]: defaultParser,
	[EXTENSIONS.GLB]: glbParser,
	[EXTENSIONS.GLTF]: gltfParser
};
const getModelParserFromExtension = (extension) => parsers[extension] || defaultParser;

const Models = {

	map: {},

	models: {},

	getModel: (name, options = {}) => {
		const model = Models.map[name] || false;

		if (model) {
			model.material.wireframe = false;
			const meshOptions = {
				...options,
				name
			};
			const mesh = new Mesh(model.geometry, model.material, meshOptions);
			mesh.setModel();

			return mesh;
		}
		return false;
	},

	loadModels: (models) => {
		Models.models = models;

		const keys = Object.keys(Models.models);

		if (!keys.length) {
			return Promise.resolve('models');
		}

		return Promise.all(keys.map(Models.loadSingleFile));
	},

	loadSingleFile: (id) => {
		const path = Models.models[id];
		const extension = extractExtension(path);
		const loader = getLoaderFromExtension(extension);
		const parser = getModelParserFromExtension(extension);

		return new Promise(resolve => {
			loader.load(path, model => {
				Models.map[id] = parser(model);
				resolve();
			});
		});
	}

}

export default Models;
