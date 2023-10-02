import { ObjectLoader } from "three";

import Element from "../entities/Element";
import { ENTITY_TYPES } from "../entities/constants";

import GLTFLoader from "../loaders/GLTFLoader";
import { FBXLoader } from "../loaders/FBXLoader";
import OBJMTLLoader from "../loaders/OBJMTLLoader";
import SkeletonUtils from "./SkeletonUtils";

import { prepareModel, processMaterial } from "../lib/meshUtils";
import { buildAssetId } from "../lib/utils/assets";
import { ROOT } from "../lib/constants";
import { ASSETS_MODEL_LOAD_FAIL, DEPRECATIONS } from "../lib/messages";
import { NOOP } from "../lib/functions";

const EXTENSIONS = {
    JSON: "json",
    GLB: "glb",
    GLTF: "gltf",
    FBX: "fbx",
    OBJ: "obj",
};

const FULL_STOP = ".";

const loaders = {
    [EXTENSIONS.JSON]: ObjectLoader,
    [EXTENSIONS.GLB]: GLTFLoader,
    [EXTENSIONS.GLTF]: GLTFLoader,
    [EXTENSIONS.FBX]: FBXLoader,
    [EXTENSIONS.OBJ]: OBJMTLLoader,
};

const loaderInstances = {};

const isURL = path => {
    try {
        const url = new URL(path);
        return url;
    } catch (_) {
        return false;
    }
};
const extractExtension = path => {
    const url = isURL(path);
    const _extract = s => s.split(FULL_STOP).slice(-1).pop();

    return url ? _extract(url.pathname) : _extract(path);
};

const getLoaderFromExtension = (extension, options) => {
    let instance = loaderInstances[extension];
    if (!instance) {
        const LoaderClass = loaders[extension] || ObjectLoader;
        instance = new LoaderClass();
        loaderInstances[extension] = instance;
    }

    instance.setOptions(options);

    return instance;
};

const glbParser = ({ scene, animations }) => {
    scene.traverse(object => {
        if (object.isMesh) {
            object.castShadow = true;
        }
    });

    return {
        animations,
        scene,
    };
};
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
        buildVisualScene,
    };
};
const fbxParser = scene => {
    scene.traverse(node => {
        if (node.isSkinnedMesh) {
            processMaterial(node.material, material => (material.skinning = true));
        }
    });

    return { scene, animations: scene.animations };
};

const getModelParserFromExtension = extension =>
    ({
        [EXTENSIONS.JSON]: defaultParser,
        [EXTENSIONS.GLB]: glbParser,
        [EXTENSIONS.GLTF]: gltfParser,
        [EXTENSIONS.COLLADA]: colladaParser,
        [EXTENSIONS.FBX]: fbxParser,
    }[extension] || defaultParser);

const hasAnimations = (animations = []) => animations.length > 0;

class Models {
    constructor() {
        this.map = {};
        this.models = {};
        this.currentLevel = ROOT;
    }

    setCurrentLevel = level => {
        this.currentLevel = level;
    };

    getModel = (name, options = {}) => {
        console.warn(DEPRECATIONS.MODELS_GETMODEL);
        return this.get(name, options);
    };

    get = (name, options = {}) => {
        const builtAssetId = buildAssetId(name, this.currentLevel);
        const { scene, animations, extension } = this.map[name] || this.map[builtAssetId] || {};

        if (scene) {
            const elementOptions = {
                name,
                ...options,
            };

            let model = scene.clone();

            if (extension !== EXTENSIONS.COLLADA && hasAnimations(animations)) {
                // we have no idea how to clone collada for the time being
                model = SkeletonUtils.clone(scene);
            }

            const element = new Element({
                body: prepareModel(model),
                ...elementOptions,
            });

            element.setEntityType(ENTITY_TYPES.MODEL);

            if (hasAnimations(animations)) {
                element.addAnimationHandler(animations);
            }

            return element;
        }

        return false;
    };

    storeModel = (name, model, extension) => {
        model.extension = extension;
        this.map[name] = model;
    };

    loadModels = (models, level) => {
        this.models = models;

        const keys = Object.keys(models);

        if (!keys.length) {
            return Promise.resolve("models");
        }

        const options = { level };

        return Promise.all(keys.map(name => this.loadAssetByName(name, options))).catch(e => {
            console.log(ASSETS_MODEL_LOAD_FAIL);
            console.log(e);

            return Promise.resolve();
        });
    };

    loadAssetByName = (name, options) => {
        if (!this.models[name]) {
            return Promise.resolve();
        }

        const path = this.models[name];

        return this.loadAssetByPath(path, name, options);
    };

    loadAssetByPath = (path, name, options = {}) => {
        const { level } = options;
        const id = buildAssetId(name, level);
        const extension = extractExtension(path);
        const loader = getLoaderFromExtension(extension, options);
        const parser = getModelParserFromExtension(extension);

        return new Promise(resolve => {
            loader.load(
                path,
                model => {
                    const parsedModel = parser(model);

                    if (parsedModel) {
                        this.storeModel(id, parsedModel, extension);
                    }

                    resolve(parsedModel);
                },
                NOOP,
                NOOP,
            );
        });
    };
}

export default new Models();
