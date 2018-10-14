import {
	TextureLoader,
	ImageLoader
} from 'three';

export class ImagesEngine {

	constructor() {
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

	}

	load() {
		// extending assets images with our defaults
		Object.assign(SceneManager.assets.Textures, this.defaults);
		Object.assign(SceneManager.assets.Images, this.imagesDefault);

		if (!(Object.keys(SceneManager.assets.Textures).length + Object.keys(SceneManager.assets.Images).length)) {
			return Promise.resolve('images');
		}

		const promises = Object
			.keys(SceneManager.assets.Textures)
			.map(this.loadSingleFile)
			.concat(Object.keys(SceneManager.assets.Images)
			.map(this.loadSingleImage));

		return Promise.all(promises);
	}

	get(key) {
		return this.map[key] || false;
	}

	loadSingleImage(id) {
		const path = SceneManager.assets.Images[id];
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
		const path = SceneManager.assets.Textures[id];
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

export default new ImagesEngine();
