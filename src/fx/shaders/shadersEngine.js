window.M = window.M || {};
M.fx = M.fx || {},

M.fx.shadersEngine = {

	SHADERS_DIR : "app/shaders/",

	SHADERS: [],

	map: new HashMap(),
	shaders: [],

	shaders: {},
	numShaders : 0,
	shadersLoaded : 0,
	update: function() {
		//console.log("inside old update ShadersEngine");
	},

	load: function() {

		if (Assets.Shaders) {
			for (var shader in Assets.Shaders) {
				M.fx.shadersEngine.numShaders++;
				M.fx.shadersEngine.loadSingleFile(shader, Assets.Shaders[shader]);
			}
		}

		if (M.fx.shadersEngine.numShaders == 0) {
			M.assetsManager.completed.shaders = true;
		}
	},

	get: function(id) {
		//returning stored shader;
		return M.fx.shadersEngine.map.get(id) || false;
	},

	loadSingleFile: function(id, path) {
		// @todo this has to be changed. We can load a M.fx.createShader file, a custom shader or a threejs shader/material.
		var type = path.split(".")[1];
		if ( type == "js" ) {
			include(path.split(".js")[0], this.checkLoad);
		} else {
			var request = new XMLHttpRequest();
			request.open("GET", path, true);
			request.responseType = "text";
			request.onload = function(e) {
				var shader = M.fx.shadersEngine._parseShader(this.responseText);
				M.fx.shadersEngine.map.put(id, shader);
				M.fx.shadersEngine.shadersLoaded++;
				M.fx.shadersEngine.checkLoad();
			};
			request.send();
		}
	},

	_parseShader: function(text) {
		var obj = {};
		obj.name = text.substring(text.indexOf("<name>")+6, text.indexOf("</name>"));
		obj.vertex = text.substring(text.indexOf("<vertex>")+8, text.indexOf("</vertex>"));
		obj.fragment = text.substring(text.indexOf("<fragment>")+10, text.indexOf("</fragment>"));
		obj.options = {};
		obj.attributes = {};
		obj.uniforms = {};
		return obj;
	},

	create: function( name, params ) {
		var obj = {};

		obj.name = name;
		obj.vertex = params.vertex || "";
		obj.fragment = params.fragment || "";
		obj.options = params.options || {};
		obj.attributes = params.attributes || {};
		obj.uniforms = params.uniforms || {};
		obj.instance = params.instance || false;

		M.fx.shadersEngine.SHADERS.push(name);
		M.fx.shadersEngine.map.put( name, obj );
	},

	checkLoad: function() {
		if (M.fx.shadersEngine.shadersLoaded == M.fx.shadersEngine.numShaders) {
			M.assetsManager.completed.shaders = true;
		}
	},

	//add method
	add: function(shader) {
		M.fx.shadersEngine.shaders.push(shader);
	},
};