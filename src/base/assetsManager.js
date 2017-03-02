window.M = window.M || {};

M.assetsManager.completed = {
	sound : false,
	video : true,
	images : false,
	general : true,
	shaders : false
};

M.assetManager.load = function(callback) {
	//first we load scripts
	//console.log(include);
	M.assetManager.callback = callback;
	//over loading scripts
	M.audioEngine.load();
	M.videoEngine.load();
	M.imagesEngine.load();
	M.generalAssetsEngine.load();
	//effects
	M.fx.ShadersEngine.load();
	M.assetManager.checkInterval = setInterval(M.assetManager.check, 100);
};

M.assetManager.loadingMessage = function(loaded) {
	//this method is up to you, developer!
	//console.log(loaded);
}

M.assetManager.check = function() {
	if (M.assetManager.completed.sound && M.assetManager.completed.video && M.assetManager.completed.images && M.assetManager.completed.general) {
		//we finished loading all assets, yay!
		M.assetManager.loadingMessage(true);
		clearInterval(M.assetManager.checkInterval);
		M.assetManager.callback();
	} else {
		M.assetManager.loadingMessage(false);
	}
}
