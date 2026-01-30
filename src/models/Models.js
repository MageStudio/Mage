import { ObjectLoader, EventDispatcher } from "three";

import env from "../env";
import Element from "../entities/Element";
import { ENTITY_TYPES } from "../entities/constants";

import { buildGLTFLoader } from "../loaders/GLTFLoader";
import { buildFBXLoader } from "../loaders/FBXLoader";
import { buildOBJMTLLoader } from "../loaders/OBJMTLLoader";
import SkeletonUtils from "./SkeletonUtils";

import { prepareModel, processMaterial } from "../lib/meshUtils";
import { buildAssetId } from "../lib/utils/assets";
import { ROOT } from "../lib/constants";
import { ASSETS_MODEL_LOAD_FAIL, DEPRECATIONS } from "../lib/messages";
import { NOOP } from "../lib/functions";
import RequirementsTracer, { REQUIREMENTS_EVENTS } from "../loaders/RequirementsTracer";

const EXTENSIONS = {
    JSON: "json",
    GLB: "glb",
    GLTF: "gltf",
    FBX: "fbx",
    OBJ: "obj",
};

const FULL_STOP = ".";

const DEFAULTbuildObjectLoader = () => ({
    tracer: new RequirementsTracer(),
    loader: new ObjectLoader(),
});

const loaders = {
    [EXTENSIONS.JSON]: DEFAULTbuildObjectLoader,
    [EXTENSIONS.GLB]: buildGLTFLoader,
    [EXTENSIONS.GLTF]: buildGLTFLoader,
    [EXTENSIONS.FBX]: buildFBXLoader,
    [EXTENSIONS.OBJ]: buildOBJMTLLoader,
};

/**
 * Checks if a path is an absolute URL (with protocol).
 */
const isAbsoluteURL = path => {
    try {
        new URL(path);
        return true;
    } catch (_) {
        return false;
    }
};

/**
 * Parses a URL and returns the URL object, or false if not a valid URL.
 * Used by extractExtension to get the pathname.
 */
const isURL = path => {
    try {
        return new URL(path);
    } catch (_) {
        return false;
    }
};

/**
 * Checks if a path already contains the assets API path.
 * This prevents double-prepending when a full path is passed.
 */
const isAlreadyResolved = path => {
    return path && (
        isAbsoluteURL(path) ||
        path.includes("/api/assets/")
    );
};

/**
 * Resolves an asset path to a full URL.
 * If path is already an absolute URL or contains the API path, returns it as-is.
 * If path is relative and MAGE_ASSETS_BASE_URL is set, prepends the base URL.
 * @param {string} path - The asset path (relative or absolute)
 * @returns {string} - The resolved full URL
 */
const resolveAssetPath = path => {
    // If already a full URL or already contains the API path, return as-is
    if (isAlreadyResolved(path)) {
        return path;
    }

    // If MAGE_ASSETS_BASE_URL is set, prepend it to the relative path
    const baseUrl = env.MAGE_ASSETS_BASE_URL;
    if (baseUrl) {
        // Remove leading slash from path if present to avoid double slashes
        const cleanPath = path.startsWith("/") ? path.slice(1) : path;
        return `${baseUrl}/${cleanPath}`;
    }

    // Fallback: return the path as-is (for backwards compatibility)
    return path;
};
const extractExtension = path => {
    const url = isURL(path);
    const _extract = s => s.split(FULL_STOP).slice(-1).pop();

    return url ? _extract(url.pathname) : _extract(path);
};

const getLoaderFromExtension = (extension, options) => {
    const loaderBuilder = loaders[extension] || DEFAULTbuildObjectLoader;
    const { loader, tracer } = loaderBuilder();

    loader.setOptions(options);

    return { tracer, loader };
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

class Models extends EventDispatcher {
    constructor() {
        super();
        this.map = {};
        this.models = {};
        this.currentLevel = ROOT;
    }

    onMissingRequirements = (modelname, cb = NOOP) => {
        this.addEventListener(`${REQUIREMENTS_EVENTS.MISSING}:${modelname}`, cb);
    };

    setCurrentLevel = level => {
        this.currentLevel = level;
    };

    getModel = (name, options = {}) => {
        console.warn(DEPRECATIONS.MODELS_GETMODEL);
        return this.create(name, options);
    };

    get = (name, options = {}) => {
        console.warn(DEPRECATIONS.MODELS_GET);
        return this.create(name, options);
    };

    create = (name, options = {}) => {
        const builtAssetId = buildAssetId(name, this.currentLevel);
        const { scene, animations, extension } = this.map[name] || this.map[builtAssetId] || {};

        if (scene) {
            const elementOptions = {
                name,
                builtAssetId,
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

            element.setEntityType(ENTITY_TYPES.MODEL.TYPE);
            element.setEntitySubtype(ENTITY_TYPES.MODEL.SUBTYPES.DEFAULT);

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
        // Resolve the path using MAGE_ASSETS_BASE_URL if available
        const resolvedPath = resolveAssetPath(path);
        const extension = extractExtension(path);
        const { loader, tracer } = getLoaderFromExtension(extension, options);
        const parser = getModelParserFromExtension(extension);

        tracer.addEventListener(REQUIREMENTS_EVENTS.MISSING, ({ requirements }) => {
            this.dispatchEvent({
                type: `${REQUIREMENTS_EVENTS.MISSING}:${name}`,
                requirements: requirements,
            });
        });

        return new Promise(resolve => {
            loader.load(
                resolvedPath,
                model => {
                    const parsedModel = parser(model);

                    if (parsedModel) {
                        this.storeModel(id, parsedModel, extension);
                    }

                    resolve(parsedModel);
                },
                NOOP,
                error => {
                    // Log error but resolve anyway to allow other assets to continue loading
                    console.warn(`[Mage] Failed to load model "${name}" from ${resolvedPath}:`, error?.message || error);
                    resolve(null);
                },
            );
        });
    };
}

export default new Models();
