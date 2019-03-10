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
			.map(this.loadSingleFile)
			.concat(Object.keys(AssetsManager.images())
			.map(this.loadSingleImage));

		return Promise.all(promises);
	}

	get(key) {
		return this.map[key] || false;
	}

	loadSingleImage = (id) => {
		const path = AssetsManager.images()[id];
		return new Promise(resolve => {
			try {
				this.imageLoader.load(path, (image) => {
					this.map[id] = image;
					resolve();
				},
				() => {},  // displaying progress
				() => {
					resolve();
				});
			} catch (e) {
				console.log('[MAGE] error loading image ' + id + ' at path ' + path);
				resolve();
			}
		})
	}

	loadSingleFile = (id) => {
		const path = AssetsManager.textures()[id];
		return new Promise(resolve => {
			try {
				this.loader.load(path, (texture) => {
					this.map[id] = texture;
					resolve();
				},
				() => {},  // displaying progress
				() => {
					resolve();
				});
			} catch (e) {
				console.log('[MAGE] error loading image ' + id + ' at path ' + path);
				resolve();
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
