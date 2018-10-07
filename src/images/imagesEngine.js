import {
	TextureLoader,
	ImageLoader
} from 'three';

export default class ImagesEngine {

	constructor(assetsManager) {
		this.defaults = {
			"waterNormal": "assets/images/waternormals.jpg",
			"water": "assets/images/water.jpg",
			'smokeparticle': 'assets/images/smokeparticle.png'
		};

		this.imagesDefault = {
			"skybox": "assets/images/skybox_1.png"
		};

		this.map = {};
		this.images = [];
		this.numImages = 0;
		this.loader = new TextureLoader();
		this.imageLoader = new ImageLoader();

		this.assetsManager = assetsManager;
	}

	load() {
		// extending assets images with our defaults
		Object.assign(Assets.Textures, this.defaults);
		Object.assign(Assets.Images, this.imagesDefault);

		if (!(Object.keys(Assets.Textures).length + Object.keys(Assets.Images).length)) {
			return Promise.resolve('images');
		}

		const promises = Object
			.keys(Assets.Textures)
			.map(this.loadSingleFile)
			.concat(Object.keys(Assets.Images)
			.map(this.loadSingleImage));

		return Promise.all(promises);
	}

	get(key) {
		return this.map[key] || false;
	}

	loadSingleImage(id) {
		const path = Assets.Images[id];
		return new Promise(resolve => {
			try {
				this.imageLoader.load(path, function(image) {
					this.map[id] = image;
					resolve();
				},
				function() {},  // displaying progress
				function() {
					console.log('An error occurred while fetching texture.');
					resolve();
				});
			} catch (e) {
				console.log('[MAGE] error loading image ' + id + ' at path ' + path);
				resolve();
			}
		})
	}

	loadSingleFile(id) {
		const path = Assets.Textures[id];
		return new Promise(resolve => {
			try {
				this.loader.load(path, function(texture) {
					this.map.put(id, texture);
					resolve();
				},
				function() {},  // displaying progress
				function() {
					console.log('An error occurred while fetching texture.');
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
			this.map.put(id, image);
		}
	}
}
