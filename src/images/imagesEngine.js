(function() {
	window.ImagesEngine = {

		numImages: 0,
		imagesLoaded: 0,

		load: function() {
			//loading images
			ImagesEngine.map = new HashMap();
			ImagesEngine.images = [];
			ImagesEngine.numImages = 0;
			ImagesEngine.loader = new THREE.TextureLoader();

			for (var image in Assets.Images) {
				ImagesEngine.numImages++;
				ImagesEngine.loadSingleFile(image, Assets.Images[image]);
			}

			if (ImagesEngine.numImages == 0) {
				AssetsManager.completed.images = true;
			}
		},

		get: function(key) {
			return ImagesEngine.map.get(key) || false;
		},

		loadSingleFile : function(id, path) {
			try {
				ImagesEngine.imagesLoaded++;
				ImagesEngine.loader.load(path, function(texture) {
					ImagesEngine.map.put(id, texture);
					ImagesEngine.checkLoad();
				}, function() {
					// displaying progress
				}, function() {
					console.log('An error occurred while fetching texture.');
					ImagesEngine.checkLoad();
				});
			} catch (e) {

			}
		},

		checkLoad: function() {
			if (ImagesEngine.imagesLoaded == ImagesEngine.numImages) {
				AssetsManager.completed.images = true;
			}
		},

		//add method
		add: function(id, image) {
			if (id && image) {
				ImagesEngine.map.put(id, image);
			}
		},
	}
})();
