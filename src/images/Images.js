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

	load = (images, textures) => {
		// extending assets images with our defaults
		this.images = {
			...images,
			...this.imagesDefault
		};

		this.textures = {
			...textures,
			...this.defaults
		};

		if (!(Object.keys(this.textures).length + Object.keys(this.images).length)) {
			return Promise.resolve('images');
		}

		const promises = Object
			.keys(this.textures)
			.map(path => this.loadSingleTexture(path))
			.concat(
				Object
					.keys(this.images)
					.map(path => this.loadSingleImage(path))
			);

		return Promise.all(promises);
	}

	get(key) {
		return this.map[key] || false;
	}

	loadSingleImage = (id, imagePath) => {
		const path = imagePath || this.images[id];
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

		const path = imagePath || this.textures[id];
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
