import Element from '../entities/Element';
import { ENTITY_TYPES } from '../entities/constants';

import {
    ObjectLoader
} from 'three';

import GLTFLoader from '../loaders/GLTFLoader';
// import ColladaLoader from '../loaders/ColladaLoader';
import { FBXLoader } from '../loaders/FBXLoader';
import SkeletonUtils from './SkeletonUtils';

import { prepareModel } from '../lib/meshUtils';
import { buildAssetId } from '../lib/utils/assets';
import { ROOT } from '../lib/constants';
import { ASSETS_MODEL_LOAD_FAIL } from '../lib/messages';
import OBJMTLLoader from '../loaders/OBJMTLLoader';

const EXTENSIONS = {
    JSON: 'json',
    GLB: 'glb',
    GLTF: 'gltf',
    // COLLADA: 'dae',
    FBX: 'fbx',
    OBJ: 'obj'
};

const FULL_STOP = '.';

const loaders = {
    [EXTENSIONS.JSON]: new ObjectLoader(),
    [EXTENSIONS.GLB]: new GLTFLoader(),
    [EXTENSIONS.GLTF]: new GLTFLoader(),
    // [EXTENSIONS.COLLADA]: new ColladaLoader(),
    [EXTENSIONS.FBX]: new FBXLoader(),
    [EXTENSIONS.OBJ]: new OBJMTLLoader()
};

const extractExtension = (path) => path.split(FULL_STOP).slice(-1).pop();
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
const fbxParser = scene => {
    scene.traverse(node => {
        if (node.isSkinnedMesh) {
            node.material.skinning = true;
        }
    });
    
    return ({ scene, animations: scene.animations })
}

const getModelParserFromExtension = (extension) => ({
    [EXTENSIONS.JSON]: defaultParser,
    [EXTENSIONS.GLB]: glbParser,
    [EXTENSIONS.GLTF]: gltfParser,
    [EXTENSIONS.COLLADA]: colladaParser,
    [EXTENSIONS.FBX]: fbxParser
})[extension] || defaultParser;

const hasAnimations = (animations = []) => animations.length > 0;

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
        } = this.map[name] || this.map[buildAssetId(name, this.currentLevel)] || {};

        if (scene) {
            const elementOptions = {
                name,
                ...options
            };

            let model = scene.clone();

            if (extension !== EXTENSIONS.COLLADA && hasAnimations(animations)) {
                // we have no idea how to clone collada for the time being
                model = SkeletonUtils.clone(scene);
            }

            const element = new Element(null, null, elementOptions);

            element.setBody({ body: prepareModel(model) });
            element.setEntityType(ENTITY_TYPES.MODEL);

            if (hasAnimations(animations)) {
                element.addAnimationHandler(animations);
            }

            return element;
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
            .all(keys.map(name => this.loadSingleFile(name, level)))
            .catch(e => {
                console.log(ASSETS_MODEL_LOAD_FAIL);
                console.log(e);
                
                return Promise.resolve();
            })
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
