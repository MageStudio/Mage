module.exports = (function() {

	var modules = {},
		order = ["libs", "controls", "entities", "base", "assets", "final"]
		DIR = "src/",
		LIB = DIR + "lib/",
		BASE = DIR + "base/",
		AUDIO = DIR + "audio/",
		VIDEO = DIR + "video/",
		LIGHTS = DIR + "lights/",
		IMAGES = DIR + "images/",
		ENTITIES = DIR + "entities/"
		GENERALASSETS = DIR + "generalAssets/",
		FX = DIR + "fx/",
		SHADERS = FX + "shaders/",
		CONTROLS = DIR + "controls/";

	modules.libs = [
		LIB + "jquery.min.js",
		LIB + "keypress.min.js",
		LIB + "three.min.js",
		LIB + "leap-0.4.3.min.js",
		LIB + "leap-plugins-0.1.3.js",
		LIB + "OBJLoader.js",
		LIB + "ParticleEngine.js",
		LIB + "ParticleEngineExamples.js",
		LIB + "physi.js",
		LIB + "tween.js",
		LIB + "underscore.js",
		LIB + "bee.min.js",
		BASE + "classy.js",
		BASE + "colors.js",
		BASE + "HashMap.js"
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
		BASE + "assetsManager.js",
		//loading effects
		FX + "fx.js"
	];

	modules.assets = [
		//audio
		AUDIO + "soundEngine.js",
		AUDIO + "beat.js",
		AUDIO + "sound.js",
		AUDIO + "ambientSound.js",
		AUDIO + "directionalSound.js",
		AUDIO + "backgroundSound.js",
		//video
		VIDEO + "videoEngine.js",
		//images
		IMAGES + "imagesEngine.js",
		//general
		GENERALASSETS + "generalAssetsEngine.js",
		//shaders
		SHADERS + "shadersEngine.js",
		SHADERS + "shader.js"
	];

	modules.entities = [
		ENTITIES + "entity.js",
		ENTITIES + "camera.js",
		ENTITIES + "mesh.js",
		ENTITIES + "shaderMesh.js",
		ENTITIES + "animatedMesh.js",
		LIGHTS + "lightEngine.js",
		LIGHTS + "light.js",
		LIGHTS + "ambiendLight.js",
		LIGHTS + "pointLight.js",
	];

	modules.final = [
		BASE + "util.js",
		BASE + "app.js"
	]

	return {
		"modules" : modules,
		"order" : order
	}

})();
