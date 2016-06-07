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
			ImagesEngine.loader.load(path , {}, function(texture) {
				ImagesEngine.map.put(id, texture);
				ImagesEngine.imagesLoaded++;
				ImagesEngine.checkLoad();
			})
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
