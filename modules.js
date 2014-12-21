module.exports = (function() {

	var modules = {},
		order = ["libs", "controls", "entities", "base", "assets", "final"]
		DIR = "src/",
		LIB = DIR + "lib/",
		BASE = DIR + "base/",
		AUDIO = DIR + "audio/",
		VIDEO = DIR + "video/",
		IMAGES = DIR + "images/",
		ENTITIES = DIR + "entities/"
		GENERALASSETS = DIR + "generalAssets/",
		CONTROLS = DIR + "controls/";

	modules.libs = [
		LIB + "jquery.min.js",
		LIB + "three.min.js",
		LIB + "leap-0.4.3.min.js",
		LIB + "leap-plugins-0.1.3.js",
		LIB + "OBJLoader.js",
		LIB + "ParticleEngine.js",
		LIB + "ParticleEngineExamples.js",
		LIB + "physi.js",
		LIB + "tween.js",
		LIB + "underscore.js",
		BASE + "classy.js",
		BASE + "colors.js",
		BASE + "HashMap.js",
		BASE + "materials.js",
	];

	modules.controls = [
		CONTROLS + "FlyControl.js",
		CONTROLS + "PointerLockControls.js"
	];

	modules.base = [
		BASE + "control.js",
		BASE + "game.js",
		BASE + "gui.js",
		BASE + "universe.js",
		BASE + "user.js",
		BASE + "assetsManager.js"
	];

	modules.assets = [
		//audio
		AUDIO + "soundEngine.js",
		AUDIO + "beat.js",
		AUDIO + "sound.js",
		AUDIO + "ambientSound.js",
		AUDIO + "directionalSound.js",
		//video
		VIDEO + "videoEngine.js",
		//images
		IMAGES + "imagesEngine.js",
		//general
		GENERALASSETS + "generalAssetsManager.js"
	];

	modules.entities = [
		ENTITIES + "entity.js",
		ENTITIES + "camera.js",
		ENTITIES + "mesh.js",
		ENTITIES + "lights.js"
	];

	modules.final = [
		BASE + "core.js"
	]

	return {
		"modules" : modules,
		"order" : order
	}

})();