import {
    TextureLoader,
    CubeTextureLoader,
    ImageBitmapLoader
} from 'three';

import { buildAssetId } from '../lib/utils/assets';
import { ROOT } from '../lib/constants';
import { ERROR_LOADING_TEXTURE } from '../lib/messages';

export class Images {

    constructor() {
        this.defaults = {};

        this.imagesDefault = {};
        this.map = {};
        this.numImages = 0;
        this.loader = new TextureLoader();
        this.imageLoader = new ImageBitmapLoader();
        this.cubeTexturesLoader = new CubeTextureLoader();

        this.images = {};
        this.textures = {};

        this.currentLevel = ROOT;
    }

    setCurrentLevel = level => {
        this.currentLevel = level;
    };

    areThereImagesToLoad = () => (
        (Object.keys(this.textures).length +
        Object.keys(this.images).length +
        Object.keys(this.cubeTextures).length) > 0
    )

    load = (images = {}, textures = {}, cubeTextures = {}, level) => {
        // extending assets images with our defaults
        this.images = images;
        this.textures = textures;
        this.cubeTextures = cubeTextures;

        if (!this.areThereImagesToLoad()) {
            return Promise.resolve('images');
        }

        const promises = Object
            .keys(this.textures)
            .map(name => this.loadSingleTexture(name, level))
            .concat(Object.keys(this.images).map(name => this.loadSingleImage(name, level)))
            .concat(Object.keys(this.cubeTextures).map(cubeTexture => this.loadSingleCubeTexture(cubeTexture, level)));

        return Promise.all(promises);
    }

    get(id) {
        return this.map[id] || this.map[buildAssetId(id, this.currentLevel)] || false;
    }

    loadSingleImage = (name, level) => {
        const id = buildAssetId(name, level);
        const path = this.images[name];

        return new Promise((resolve, reject) => {
            try {
                this.imageLoader.load(path, (image) => {
                    this.add(id, image);
                    resolve(image);
                },
                () => {},
                resolve);
            } catch (e) {
                console.log(ERROR_LOADING_TEXTURE, name, path);
                reject();
            }
        })
    }

    loadSingleTexture = (name, level) => {
        const id = buildAssetId(name, level);
        const path = this.textures[name];

        return new Promise((resolve, reject) => {
            try {
                this.loader.load(path, (texture) => {
                    this.add(id, texture);
                    resolve(texture);
                },
                () => {},
                () => {
                    console.log(ERROR_LOADING_TEXTURE, name, path);
                    resolve();
                });
            } catch (e) {
                console.log(ERROR_LOADING_TEXTURE, name, path);
                reject();
            }
        });
    }

    loadSingleCubeTexture = (name, level) => {
        const id = buildAssetId(name, level);
        const paths = this.cubeTextures[name];

        return new Promise((resolve, reject) => {
            try {
                if (paths instanceof Array) {
                    this.cubeTexturesLoader.load(paths, texture => {
                        this.add(id, texture);
                        resolve(texture);
                    },
                    () => {},
                    () => {
                        console.log(ERROR_LOADING_TEXTURE, name, paths);
                        resolve();
                    })
                } else {
                    console.log(CUBE_TEXTURES_NOT_LIST);
                    reject();
                }
            } catch(e) {
                console.log(ERROR_LOADING_TEXTURE, name, path);
                reject();
            }
        });
    }

    add(id, image) {
        if (id && image) {
            this.map[id] = image;
        }
    }
}

export default new Images();
