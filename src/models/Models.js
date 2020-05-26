import { ENTITY_TYPES } from '../entities/BaseEntity';
import BaseMesh from '../entities/BaseMesh';
import {
	MeshLambertMaterial,
	ObjectLoader
} from 'three';

import GLTFLoader from '../loaders/GLTFLoader';
import ColladaLoader from '../loaders/ColladaLoader';

const EXTENSIONS = {
	JSON: 'json',
	GLB: 'glb',
	GLTF: 'gltf',
	COLLADA: 'dae'
};

const FULL_STOP = '.';

const loaders = {
	[EXTENSIONS.JSON]: new ObjectLoader(),
	[EXTENSIONS.GLB]: new GLTFLoader(),
	[EXTENSIONS.GLTF]: new GLTFLoader(),
	[EXTENSIONS.COLLADA]: new ColladaLoader()
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
const glbParser = (glb) => { model: glb.scene.children[0] };
const defaultParser = model => { model };
const colladaParser = ({ animations, scene }) => {
	const model = scene.children.filter(c => c.geometry && c.material)[0];

	if (model.isSkinnedMesh) {
		model.frustumCulled = false;
	}

	return {
		animations,
		model
	}
};

const parsers = {
	[EXTENSIONS.JSON]: defaultParser,
	[EXTENSIONS.GLB]: glbParser,
	[EXTENSIONS.GLTF]: gltfParser,
	[EXTENSIONS.COLLADA]: colladaParser
};
const getModelParserFromExtension = (extension) => parsers[extension] || defaultParser;

class Models {

	constructor() {
		this.map = {};
		this.models = {};
	}

	getModel = (name, options = {}) => {
		const { model, animations } = this.map[name] || false;

		if (model) {
			const meshOptions = {
				...options,
				name
			};
			const mesh = new BaseMesh(null, null, meshOptions);
			mesh.setMesh(model);
			mesh.setEntityType(ENTITY_TYPES.MODEL);

			if (animations) {
				mesh.addAnimationHandler(animations);
			}

			return mesh;
		}
		return false;
	}

	storeModel = (name, model) => {
		this.map[name] = model;
	}

	loadModels = (models) => {
		this.models = models;

		const keys = Object.keys(this.models);

		if (!keys.length) {
			return Promise.resolve('models');
		}

		return Promise.all(keys.map(this.loadSingleFile));
	}

	loadSingleFile = (id) => {
		const path = this.models[id];
		const extension = extractExtension(path);
		const loader = getLoaderFromExtension(extension);
		const parser = getModelParserFromExtension(extension);

		return new Promise(resolve => {
			loader.load(path, model => {
				const parsedModel = parser(model);

				if (parsedModel) {
					this.storeModel(id, parsedModel);
				} 
				
				resolve();
			});
		});
	}

}

export default new Models();
