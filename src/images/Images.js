import { TextureLoader, ImageLoader, CubeTextureLoader } from "three";

import { buildAssetId } from "../lib/utils/assets";
import { ROOT } from "../lib/constants";
import { ERROR_LOADING_TEXTURE } from "../lib/messages";

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

        if (!paths instanceof Array) {
            console.log(CUBE_TEXTURES_NOT_LIST);
            return Promise.reject();
        }

        return this.loadAssetByPath(paths, name, level, this.LOADERS.CUBE_TEXTURE);
    };

    loadAssetByPath = (path, name, level, loaderType = this.LOADERS.TEXTURE) => {
        const id = buildAssetId(name, level);
        const loader = this.getLoaderByType(loaderType);

        return new Promise((resolve, reject) => {
            try {
                loader.load(
                    path,
                    asset => {
                        this.add(id, asset);
                        resolve(asset);
                    },
                    () => {},
                    () => {
                        console.log(ERROR_LOADING_TEXTURE, name, path);
                        resolve();
                    },
                );
            } catch (e) {
                console.log(ERROR_LOADING_TEXTURE, name, path);
                reject();
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
