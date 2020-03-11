import Mesh from '../entities/Mesh';
import {
	MeshLambertMaterial,
	ObjectLoader
} from 'three';

import GLTFLoader from '../loaders/GLTFLoader';
import AssetsManager from '../base/AssetsManager';

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

const ModelsEngine = {
	map: {},
	getModel: (name, options = {}) => {
		const model = ModelsEngine.map[name] || false;

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
		const parser = getModelParserFromExtension(extension);

		return new Promise(resolve => {
			loader.load(path, model => {
				ModelsEngine.map[id] = parser(model);
				resolve();
			});
		});
	}

}

export default ModelsEngine;
