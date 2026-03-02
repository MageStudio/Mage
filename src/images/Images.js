import { TextureLoader, ImageLoader, CubeTextureLoader } from "three";

import env from "../env";
import { buildAssetId } from "../lib/utils/assets";
import { ROOT } from "../lib/constants";
import { ERROR_LOADING_TEXTURE, CUBE_TEXTURES_NOT_LIST } from "../lib/messages";

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
 * Checks if a path is already a fully resolved URL.
 * The engine is agnostic about asset locations - it just needs to know
 * if the path is absolute (use as-is) or relative (prepend base URL).
 */
const isAlreadyResolved = path => {
    return path && isAbsoluteURL(path);
};

/**
 * Resolves a single asset path to a full URL using MAGE_ASSETS_BASE_URL.
 */
const resolveSinglePath = path => {
    // If already a full URL or already contains the API path, return as-is
    if (isAlreadyResolved(path)) {
        return path;
    }

    // Root-relative paths (starting with /) are served from the public folder
    // and should not be modified with base URL
    if (path && path.startsWith("/")) {
        return path;
    }

    const baseUrl = env.MAGE_ASSETS_BASE_URL;
    if (baseUrl) {
        return `${baseUrl}/${path}`;
    }

    // Warn if path contains colon (could be mistaken for protocol) and no base URL is set
    if (path && path.includes(":") && !path.startsWith("/")) {
        console.warn(
            `[Mage] Asset path "${path}" contains a colon but MAGE_ASSETS_BASE_URL is not set. ` +
                `This may cause the browser to interpret it as a protocol scheme. ` +
                `Prepending "./" to make it a relative path.`,
        );
        return `./${path}`;
    }

    return path;
};

/**
 * Resolves asset path(s) to full URL(s) using MAGE_ASSETS_BASE_URL.
 * Handles both single paths (string) and arrays of paths (for cube textures).
 */
const resolveAssetPath = pathOrPaths => {
    if (Array.isArray(pathOrPaths)) {
        return pathOrPaths.map(p => resolveSinglePath(p));
    }
    return resolveSinglePath(pathOrPaths);
};

export class Images {
    constructor() {
        this.defaults = {};

        this.imagesDefault = {};

        this.map = {};
        this.numImages = 0;
        this.textureLoader = new TextureLoader();
        this.imageLoader = new ImageLoader();
        this.cubeTexturesLoader = new CubeTextureLoader();

        this.images = {};
        this.textures = {};

        this.currentLevel = ROOT;
    }

    get LOADERS() {
        return {
            IMAGE: "image",
            TEXTURE: "texture",
            CUBE_TEXTURE: "cubeTexture",
        };
    }

    getLoaderByType = type => {
        switch (type) {
            case this.LOADERS.IMAGE:
                return this.imageLoader;
            case this.LOADERS.TEXTURE:
                return this.textureLoader;
            case this.LOADERS.CUBE_TEXTURE:
                return this.cubeTexturesLoader;
            default:
                return null;
        }
    };

    setCurrentLevel = level => {
        this.currentLevel = level;
    };

    areThereImagesToLoad = () =>
        Object.keys(this.textures).length +
            Object.keys(this.images).length +
            Object.keys(this.cubeTextures).length >
        0;

    load = (images = {}, textures = {}, cubeTextures = {}, level) => {
        this.images = images;
        this.textures = textures;
        this.cubeTextures = cubeTextures;

        if (!this.areThereImagesToLoad()) {
            return Promise.resolve("images");
        }

        const promises = Object.keys(this.textures)
            .map(name => this.loadTextureByName(name, level))
            .concat(Object.keys(this.images).map(name => this.loadImageByName(name, level)))
            .concat(
                Object.keys(this.cubeTextures).map(cubeTexture =>
                    this.loadCubeTextureByName(cubeTexture, level),
                ),
            );

        return Promise.all(promises);
    };

    get(id) {
        return this.map[id] || this.map[buildAssetId(id, this.currentLevel)] || false;
    }

    loadImageByName = (name, level) => {
        const path = this.images[name];

        return this.loadAssetByPath(path, name, level, this.LOADERS.IMAGE);
    };

    loadTextureByName = (name, level) => {
        const path = this.textures[name];

        this.loadAssetByPath(path, name, level, this.LOADERS.TEXTURE);
    };

    loadCubeTextureByName = (name, level) => {
        const paths = this.cubeTextures[name];

        if ((!paths) instanceof Array) {
            console.log(CUBE_TEXTURES_NOT_LIST);
            return Promise.reject();
        }

        return this.loadAssetByPath(paths, name, level, this.LOADERS.CUBE_TEXTURE);
    };

    loadAssetByPath = (path, name, level, loaderType = this.LOADERS.TEXTURE) => {
        const id = buildAssetId(name, level);
        const loader = this.getLoaderByType(loaderType);
        // Resolve the path using MAGE_ASSETS_BASE_URL if available
        const resolvedPath = resolveAssetPath(path);

        return new Promise(resolve => {
            try {
                loader.load(
                    resolvedPath,
                    asset => {
                        this.add(id, asset);
                        resolve(asset);
                    },
                    () => {},
                    error => {
                        // Log warning but resolve anyway to allow other assets to continue loading
                        console.warn(
                            `[Mage] ${ERROR_LOADING_TEXTURE}`,
                            name,
                            path,
                            error?.message || "",
                        );
                        resolve(null);
                    },
                );
            } catch (e) {
                // Log warning but resolve anyway to allow other assets to continue loading
                console.warn(`[Mage] ${ERROR_LOADING_TEXTURE}`, name, path, e?.message || "");
                resolve(null);
            }
        });
    };

    disposeTexture(id) {
        const texture = this.get(id);
        texture.dispose();

        this.map[id] = null;
    }

    add(id, image) {
        if (id && image) {
            this.map[id] = image;
        }
    }
}

export default new Images();
