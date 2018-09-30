export default class ImagesEngine {

	constructor(assetsManager) {
		this.numImages = 0;
		this.imagesLoaded = 0;
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
		this.loader = new THREE.TextureLoader();
		this.imageLoader = new THREE.ImageLoader();

		this.assetsManager = assetsManager;
	}

	load() {
		// extending assets images with our defaults
		Object.assign(Assets.Textures, this.defaults);
		Object.assign(Assets.Images, this.imagesDefault);

		for (var image in Assets.Textures) {
			this.numImages++;
			this.loadSingleFile(image, Assets.Textures[image]);
		}

		for (var image in Assets.Images) {
			this.numImages++;
			this.loadSingleImage(image, Assets.Images[image]);
		}

		if (this.numImages == 0) {
			this.assetsManager.completed.images = true;
		}
	}

	get(key) {
		return this.map[key] || false;
	}

	loadSingleImage(id, path) {
		try {
			this.imagesLoaded++;
			this.imageLoader.load(path, function(image) {
				this.map[id] = image;
				this.checkLoad();
			}, function() {
				// displaying progress
			}, function() {
				console.log('An error occurred while fetching texture.');
				this.checkLoad();
			});
		} catch (e) {
			console.log('[MAGE] error loading image ' + id + ' at path ' + path);
		}
	}

	loadSingleFile(id, path) {
		try {
			this.imagesLoaded++;
			this.loader.load(path, function(texture) {
				this.map.put(id, texture);
				this.checkLoad();
			}, function() {
				// displaying progress
			}, function() {
				console.log('An error occurred while fetching texture.');
				this.checkLoad();
			});
		} catch (e) {

		}
	}

	checkLoad() {
		if (this.imagesLoaded == this.numImages) {
			this.assetsManager.completed.images = true;
		}
	}

	add(id, image) {
		if (id && image) {
			this.map.put(id, image);
		}
	}
}
