import { BaseMesh, ENTITY_TYPES } from '../entities';
import {
    ObjectLoader
} from 'three';

import GLTFLoader from '../loaders/GLTFLoader';
import ColladaLoader from '../loaders/ColladaLoader';
import SkeletonUtils from './SkeletonUtils';

import { prepareModel } from '../lib/meshUtils';
import { buildAssetId } from '../lib/utils/assets';
import { ROOT } from '../lib/constants';

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

const glbParser = ({ scene, animations }) => {
    scene.traverse((object) => {
        if (object.isMesh) {
            object.castShadow = true;
        }
    });

    return {
        animations,
        scene
    }
}
const gltfParser = ({ scene, animations }) => ({ scene, animations });
const defaultParser = scene => ({ scene });
const colladaParser = ({ animations, scene, rawSceneData, buildVisualScene }) => {
    scene.traverse(node => {
        if (node.isSkinnedMesh) {
            node.frustumCulled = false;
        }
    });

    return {
        animations,
        scene,
        rawSceneData,
        buildVisualScene
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
        this.currentLevel = ROOT;
    }

    setCurrentLevel = level => {
        this.currentLevel = level;
    }

    getModel = (name, options = {}) => {
        const {
            scene,
            animations,
            extension
        } = this.map[name] ||this.map[buildAssetId(name, this.currentLevel)] || false;

        if (scene) {
            const meshOptions = {
                name,
                ...options
            };

            let model = scene;
            if (extension !== EXTENSIONS.COLLADA) {
                // we have no idea how to clone collada for the time being
                model = SkeletonUtils.clone(scene);
            }

            const mesh = new BaseMesh(null, null, meshOptions);

            mesh.setMesh({ mesh: prepareModel(model) });
            mesh.setEntityType(ENTITY_TYPES.MODEL);

            if (animations) {
                mesh.addAnimationHandler(animations);
            }

            return mesh;
        }

        return false;
    }

    storeModel = (name, model, extension) => {
        model.extension = extension;
        this.map[name] = model;
    }

    loadModels = (models, level) => {
        this.models = models;

        const keys = Object.keys(this.models);

        if (!keys.length) {
            return Promise.resolve('models');
        }

        return Promise
            .all(keys.map(name => this.loadSingleFile(name, level)));
    }

    loadSingleFile = (name, level) => {
        const path = this.models[name];
        const id = buildAssetId(name, level);
        const extension = extractExtension(path);
        const loader = getLoaderFromExtension(extension);
        const parser = getModelParserFromExtension(extension);

        return new Promise(resolve => {
            loader.load(path, model => {
                const parsedModel = parser(model);

                if (parsedModel) {
                    this.storeModel(id, parsedModel, extension);
                } 
                
                resolve();
            });
        });
    }

}

export default new Models();
