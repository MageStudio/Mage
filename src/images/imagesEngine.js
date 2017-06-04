(function() {

	window.M = window.M || {};

	M.imagesEngine = {

		numImages: 0,
		imagesLoaded: 0,

		defaults: {
			"waterNormal": "assets/images/waternormals.jpg",
			"water": "assets/images/water.jpg",
			'smokeparticle': 'assets/images/smokeparticle.png'
		},

		imagesDefault: {
			"skybox": "assets/images/skybox_1.png"
		},

		load: function() {
			//loading images
			M.imagesEngine.map = new HashMap();
			M.imagesEngine.images = [];
			M.imagesEngine.numImages = 0;
			M.imagesEngine.loader = new THREE.TextureLoader();
			M.imagesEngine.imageLoader = new THREE.ImageLoader();

			// extending assets images with our defaults
			Object.assign(Assets.Textures, M.imagesEngine.defaults);
			Object.assign(Assets.Images, M.imagesEngine.imagesDefault);

			for (var image in Assets.Textures) {
				M.imagesEngine.numImages++;
				M.imagesEngine.loadSingleFile(image, Assets.Textures[image]);
			}

			for (var image in Assets.Images) {
				M.imagesEngine.numImages++;
				M.imagesEngine.loadSingleImage(image, Assets.Images[image]);
			}

			if (M.imagesEngine.numImages == 0) {
				M.assetsManager.completed.images = true;
			}
		},

		get: function(key) {
			return M.imagesEngine.map.get(key) || false;
		},

		loadSingleImage: function(id, path) {
				try {
				M.imagesEngine.imagesLoaded++;
				M.imagesEngine.imageLoader.load(path, function(image) {
					M.imagesEngine.map.put(id, image);
					M.imagesEngine.checkLoad();
				}, function() {
					// displaying progress
				}, function() {
					console.log('An error occurred while fetching texture.');
					M.imagesEngine.checkLoad();
				});
			} catch (e) {
				console.log('[MAGE] error loading image ' + id + ' at path ' + path);
			}
		},

		loadSingleFile : function(id, path) {
			try {
				M.imagesEngine.imagesLoaded++;
				M.imagesEngine.loader.load(path, function(texture) {
					M.imagesEngine.map.put(id, texture);
					M.imagesEngine.checkLoad();
				}, function() {
					// displaying progress
				}, function() {
					console.log('An error occurred while fetching texture.');
					M.imagesEngine.checkLoad();
				});
			} catch (e) {

			}
		},

		checkLoad: function() {
			if (M.imagesEngine.imagesLoaded == M.imagesEngine.numImages) {
				M.assetsManager.completed.images = true;
			}
		},

		//add method
		add: function(id, image) {
			if (id && image) {
				M.imagesEngine.map.put(id, image);
			}
		},
	}
})();
