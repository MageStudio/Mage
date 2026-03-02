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

const DEFAULTbuildObjectLoader = () => {
    const loader = new ObjectLoader();
    // Add setOptions for compatibility with the loader interface
    loader.setOptions = () => {};
    return {
        tracer: new RequirementsTracer(),
        loader,
    };
};

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
 * Checks if a path is already a fully resolved URL.
 * The engine is agnostic about asset locations - it just needs to know
 * if the path is absolute (use as-is) or relative (prepend base URL).
 */
const isAlreadyResolved = path => {
    return path && isAbsoluteURL(path);
};

/**
 * Resolves an asset path to a full URL.
 * If path is already an absolute URL or contains the API path, returns it as-is.
 * If path is root-relative (starts with /), returns it as-is (served from public folder).
 * If path is relative and MAGE_ASSETS_BASE_URL is set, prepends the base URL.
 * @param {string} path - The asset path (relative or absolute)
 * @returns {string} - The resolved full URL
 */
const resolveAssetPath = path => {
    // If already a full URL or already contains the API path, return as-is
    if (isAlreadyResolved(path)) {
        return path;
    }

    // Root-relative paths (starting with /) are served from the public folder
    // and should not be modified with base URL
    if (path && path.startsWith("/")) {
        return path;
    }

    // If MAGE_ASSETS_BASE_URL is set, prepend it to the relative path
    const baseUrl = env.MAGE_ASSETS_BASE_URL;
    if (baseUrl) {
        return `${baseUrl}/${path}`;
    }

    // Warn if path contains colon (could be mistaken for protocol) and no base URL is set
    if (path && path.includes(":") && !path.startsWith("/")) {
        console.warn(
            `[Mage] Asset path "${path}" contains a colon but MAGE_ASSETS_BASE_URL is not set. ` +
            `This may cause the browser to interpret it as a protocol scheme. ` +
            `Prepending "./" to make it a relative path.`
        );
        return `./${path}`;
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

const glbParser = (gltf) => {
    // GLTF/GLB loader returns { scene, animations, ... }
    if (!gltf || !gltf.scene) {
        console.error('[Mage] GLB parser received invalid GLTF object:', {
            type: gltf?.constructor?.name,
            keys: gltf ? Object.keys(gltf) : [],
        });
        return null;
    }

    const { scene, animations } = gltf;
    scene.traverse(object => {
        if (object.isMesh) {
            object.castShadow = true;
        }
        if (object.isSkinnedMesh) {
            object.frustumCulled = false;
        }
    });

    return {
        animations,
        scene,
    };
};
const gltfParser = (gltf) => {
    // GLTF loader returns { scene, animations, ... }
    if (!gltf || !gltf.scene) {
        console.error('[Mage] GLTF parser received invalid GLTF object:', {
            type: gltf?.constructor?.name,
            keys: gltf ? Object.keys(gltf) : [],
        });
        return null;
    }

    gltf.scene.traverse(node => {
        if (node.isSkinnedMesh) {
            node.frustumCulled = false;
        }
    });

    return { scene: gltf.scene, animations: gltf.animations };
};
const defaultParser = scene => {
    // Validate the scene is a proper THREE.js object
    if (!scene || typeof scene.traverse !== 'function') {
        console.error('[Mage] Default parser received invalid scene object:', {
            type: scene?.constructor?.name,
            isObject3D: scene?.isObject3D,
            keys: scene ? Object.keys(scene) : [],
        });
        return null;
    }
    return { scene };
};
const colladaParser = (collada) => {
    // Collada loader returns { animations, scene, ... }
    if (!collada || !collada.scene) {
        console.error('[Mage] Collada parser received invalid object:', {
            type: collada?.constructor?.name,
            keys: collada ? Object.keys(collada) : [],
        });
        return null;
    }

    const { animations, scene, rawSceneData, buildVisualScene } = collada;
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
    // Validate the FBX loader returned a proper THREE.js object
    if (!scene || typeof scene.traverse !== 'function') {
        console.error('[Mage] FBX parser received invalid scene object:', {
            type: scene?.constructor?.name,
            isObject3D: scene?.isObject3D,
            keys: scene ? Object.keys(scene) : [],
        });
        return null;
    }

    scene.traverse(node => {
        if (node.isSkinnedMesh) {
            node.frustumCulled = false;
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
        const modelData = this.map[name] || this.map[builtAssetId];

        if (!modelData) {
            console.warn(`[Mage] Model "${name}" not found in map. Available: ${Object.keys(this.map).join(', ')}`);
            return false;
        }

        const { scene, animations, extension } = modelData;

        // Debug: Log model structure
        console.log(`[Mage] Creating model "${name}":`, {
            hasScene: !!scene,
            sceneType: scene?.type,
            childrenCount: scene?.children?.length,
            animations: animations?.length || 0,
            extension,
        });

        // Debug: Check for meshes in the scene
        let meshCount = 0;
        let skinnedMeshCount = 0;
        scene?.traverse?.(node => {
            if (node.isMesh) meshCount++;
            if (node.isSkinnedMesh) skinnedMeshCount++;
        });
        console.log(`[Mage] Model "${name}" contains: ${meshCount} meshes, ${skinnedMeshCount} skinned meshes`);

        // Validate that scene is a valid THREE.js object with required methods
        if (!scene || typeof scene.clone !== 'function' || typeof scene.traverse !== 'function') {
            console.warn(`[Mage] Model "${name}" has invalid scene object. Got:`, Object.keys(modelData));
            return false;
        }

        const elementOptions = {
            name,
            builtAssetId,
            ...options,
        };

        let model;

        // Check if the scene contains any skinned meshes
        let hasSkinnedMeshes = false;
        scene.traverse(node => {
            if (node.isSkinnedMesh) {
                hasSkinnedMeshes = true;
            }
        });

        // Use SkeletonUtils.clone for models with skinned meshes OR animations
        // Regular clone() doesn't properly handle skeleton binding
        const useSkeletonClone = extension !== EXTENSIONS.COLLADA && (hasAnimations(animations) || hasSkinnedMeshes);

        try {
            if (useSkeletonClone) {
                model = SkeletonUtils.clone(scene);
            } else {
                model = scene.clone();
            }
        } catch (cloneError) {
            console.error(`[Mage] Error cloning model "${name}":`, cloneError);
            return false;
        }

        // Validate the cloned model
        const preparedBody = prepareModel(model);

        if (!preparedBody) {
            console.warn(`[Mage] Model "${name}" failed to prepare after cloning`);
            return false;
        }

        // IMPORTANT: body must come AFTER elementOptions spread to ensure
        // our preparedBody is used, not any 'body' property from saved options
        const element = new Element({
            ...elementOptions,
            body: preparedBody,
        });

        element.setEntityType(ENTITY_TYPES.MODEL.TYPE);
        element.setEntitySubtype(ENTITY_TYPES.MODEL.SUBTYPES.DEFAULT);

        if (hasAnimations(animations)) {
            element.addAnimationHandler(animations);
        }

        // Debug: Log element body info
        const body = element.getBody?.();
        if (body) {
            console.log(`[Mage] Element "${name}" body:`, {
                type: body.type,
                visible: body.visible,
                position: body.position?.toArray?.(),
                scale: body.scale?.toArray?.(),
                childrenCount: body.children?.length,
            });
        }

        return element;
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

        const modelConfig = this.models[name];

        // Support both string paths and objects with path + dependencies
        // String format: "models/mymodel.fbx"
        // Object format: { path: "models/mymodel.fbx", dependencies: { texture: "textures/tex.png" } }
        if (typeof modelConfig === "string") {
            return this.loadAssetByPath(modelConfig, name, options);
        } else if (modelConfig && typeof modelConfig === "object") {
            const { path, dependencies = {} } = modelConfig;
            return this.loadAssetByPath(path, name, { ...options, ...dependencies });
        }

        return Promise.resolve();
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
