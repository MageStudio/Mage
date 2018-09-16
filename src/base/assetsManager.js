window.M = window.M || {};

M.assetsManager = {};

M.assetsManager.completed = {
	sound: false,
	video: true,
	images: false,
	models: false,
	shaders: false
};

M.assetsManager.load = function(callback) {
	//first we load scripts
	//console.log(include);
	M.assetsManager.callback = callback;
	//over loading scripts
	M.audioEngine.load();
	M.videoEngine.load();
	M.imagesEngine.load();
	M.modelsEngine.load();
	//effects
	M.fx.shadersEngine.load();
	M.assetsManager.checkInterval = setInterval(M.assetsManager.check, 100);
};

M.assetsManager.loadingMessage = function(loaded) {
	//this method is up to you, developer!
	//console.log(loaded);
}

M.assetsManager.check = function() {
	if (M.assetsManager.completed.sound && M.assetsManager.completed.video && M.assetsManager.completed.images && M.assetsManager.completed.models) {
		//we finished loading all assets, yay!
		M.assetsManager.loadingMessage(true);
		clearInterval(M.assetsManager.checkInterval);
		M.assetsManager.callback();
	} else {
		M.assetsManager.loadingMessage(false);
	}
}
