import {
	TextureLoader,
	ImageLoader
} from 'three';

import AssetsManager from '../base/AssetsManager';

export class ImagesEngine {

	constructor() {
		this.defaults = {
			//"waterNormal": "assets/images/waternormals.jpg",
			//"water": "assets/images/water.jpg",
			//'smokeparticle': 'assets/images/smokeparticle.png'
		};

		this.imagesDefault = {
			//"skybox": "assets/images/skybox_1.png"
		};

		this.map = {};
		this.images = [];
		this.numImages = 0;
		this.loader = new TextureLoader();
		this.imageLoader = new ImageLoader();

	}

	load = () => {
		// extending assets images with our defaults
		Object.assign(AssetsManager.textures(), this.defaults);
		Object.assign(AssetsManager.images(), this.imagesDefault);

		if (!(Object.keys(AssetsManager.textures()).length + Object.keys(AssetsManager.images()).length)) {
			return Promise.resolve('images');
		}

		const promises = Object
			.keys(AssetsManager.textures())
			.map(path => this.loadSingleTexture(path))
			.concat(Object.keys(AssetsManager.images())
			.map(path => this.loadSingleImage(path)));

		return Promise.all(promises);
	}

	get(key) {
		return this.map[key] || false;
	}

	loadSingleImage = (id, imagePath) => {
		const path = imagePath || AssetsManager.images()[id];
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

	loadSingleTexture = (id, imagePath) => {
		const existingTexture = this.get(id);
		if (existingTexture) {
			return Promise.resolve(existingTexture);
		}

		const path = imagePath || AssetsManager.textures()[id];
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

export default new ImagesEngine();
