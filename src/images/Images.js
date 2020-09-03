import {
    TextureLoader,
    ImageLoader
} from 'three';

export class Images {

    constructor() {
        this.defaults = {};

        this.imagesDefault = {};

        this.map = {};
        this.numImages = 0;
        this.loader = new TextureLoader();
        this.imageLoader = new ImageLoader();

        this.images = {};
        this.textures = {};
    }

    load = (images = {}, textures = {}, level) => {
        // extending assets images with our defaults
        this.images = images;
        this.textures = textures;

        if (!(Object.keys(this.textures).length + Object.keys(this.images).length)) {
            return Promise.resolve('images');
        }

        const promises = Object
            .keys(this.textures)
            .map(name => this.loadSingleTexture(name, level))
            .concat(
                Object
                    .keys(this.images)
                    .map(name => this.loadSingleImage(name, level))
            );

        return Promise.all(promises);
    }

    get(id) {
        const level = Router.getCurrentLevel();
        return this.map[id] || this.map[buildAssetId(id, level)] || false;
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
                () => {},  // displaying progress
                () => {
                    resolve();
                });
            } catch (e) {
                console.log('[MAGE] error loading image ' + id + ' at path ' + path);
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
                () => {},  // displaying progress
                () => {
                    console.log('[Mage] error loading texture ' + id + ' at path ' + path);
                    resolve();
                });
            } catch (e) {
                console.log('[MAGE] error loading texture ' + id + ' at path ' + path);
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
