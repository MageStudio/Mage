/*
module.exports = (function() {

	var modules = {},
		order = ["libs", "controls", "entities", "base", "assets", "app", "loaders"],
		DIR = "src/",
		LIB = DIR + "lib/",
		BASE = DIR + "base/",
		LOADERS = DIR + "loaders/",
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
		LIGHTS + "ambientLight.js",
		LIGHTS + "pointLight.js",
		LIGHTS + "directionalLight.js",
	];

	modules.app = [
		BASE + "util.js",
		BASE + "app.js"
	];

	modules.loaders = [
		LOADERS + "lightLoader.js",
		LOADERS + "meshLoader.js"
	];

	return {
		"modules" : modules,
		"order" : order
	}

})();


libs
CORE
	ALL THE ENGINES
	UTIL
	APP	

AUDIO
	classes and shit

loaders

video

lights






*/

module.exports = (function() {

	var modules = {},
		//order = ["libs", "controls", "entities", "base", "assets", "app", "loaders"],
		available = ['libs', 'core', 'game', 'assets', 'controls', 'entities', 'loaders'],
		DIR = "src/",
		LIB = DIR + "lib/",
		BASE = DIR + "base/",
		LOADERS = DIR + "loaders/",
		AUDIO = DIR + "audio/",
		VIDEO = DIR + "video/",
		LIGHTS = DIR + "lights/",
		IMAGES = DIR + "images/",
		ENTITIES = DIR + "entities/"
		GENERALASSETS = DIR + "generalAssets/",
		FX = DIR + "fx/",
		SHADERS = FX + "shaders/",
		SHADERS_MATERIALS = FX + '/materials';
		CONTROLS = DIR + "controls/";

	// 1
	modules.libs = [
		LIB + "jquery.min.js",
		LIB + "keypress.min.js",
		LIB + "leap-0.4.3.min.js",
		LIB + "leap-plugins-0.1.3.js",
		LIB + "three.min.js",
		LIB + "OBJLoader.js",
		LIB + "physi.js",
		LIB + "tween.js",

		LIB + "ParticleEngine.js",
		LIB + "ParticleEngineExamples.js",
		LIB + "underscore.js",
	];

	// 2
	modules.core = [

		BASE + 'detector.js',
		BASE + "classy.js",

		

		// libraries always needed
		LIB + "bee.min.js",
		BASE + "colors.js",
		BASE + "HashMap.js",

		
		// engines
		BASE + "assetsManager.js",
		//loading effects
		FX + "fx.js",
		AUDIO + "soundEngine.js",
		VIDEO + "videoEngine.js",
		IMAGES + "imagesEngine.js",
		LIGHTS + "lightEngine.js",
		GENERALASSETS + "generalAssetsEngine.js",
		SHADERS + "shadersEngine.js",

		SHADERS_MATERIALS + 'Mirror.js',
		SHADERS_MATERIALS + 'Atmosphere.js',
		SHADERS_MATERIALS + 'Water.js',

		BASE + "main.js",
	];

	// 3
	modules.game = [
		
		BASE + "util.js",
		BASE + "control.js",
		BASE + "game.js",
		BASE + "gui.js",
		BASE + "universe.js",
		BASE + "user.js"
	];

	// 4
	modules.assets = [
		//audio
		AUDIO + "beat.js",
		AUDIO + "sound.js",
		AUDIO + "ambientSound.js",
		AUDIO + "directionalSound.js",
		AUDIO + "backgroundSound.js",
		SHADERS + "shader.js"
	];

	// 4
	modules.controls = [
		CONTROLS + "FlyControl.js",
		CONTROLS + "PointerLockControls.js"
	];

	// 5
	modules.entities = [
		ENTITIES + "entity.js",
		ENTITIES + "camera.js",
		ENTITIES + "mesh.js",
		ENTITIES + "shaderMesh.js",
		ENTITIES + "animatedMesh.js",
		LIGHTS + "light.js",
		LIGHTS + "ambientLight.js",
		LIGHTS + "pointLight.js",
		LIGHTS + "directionalLight.js",
	];

	// 6
	modules.loaders = [
		LOADERS + "lightLoader.js",
		LOADERS + "meshLoader.js"
	];

	return {
		"modules" : modules,
		"available" : available
	}

})();
