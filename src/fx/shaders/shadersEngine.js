window.fx.ShadersEngine = {

	SHADERS_DIR : "app/shaders/",

	shaders: {},
	numShaders : 0,
	shadersLoaded : 0,
	update: function() {
		//console.log("inside old update ShadersEngine");
	},

	load: function() {

		fx.ShadersEngine.map = new HashMap();
		fx.ShadersEngine.shaders = [];
		if (Assets.Shaders) {
			for (var shader in Assets.Shaders) {
				fx.ShadersEngine.numShaders++;
				fx.ShadersEngine.loadSingleFile(shader, Assets.Shaders[shader]);
			}
		}

		if (fx.ShadersEngine.numShaders == 0) {
			AssetsManager.completed.shaders = true;
		}
	},

	get: function(id) {
		//returning stored shader;
		return fx.ShadersEngine.map.get(id) || false;
	},

	loadSingleFile: function(id, path) {
		var type = path.split(".")[1];
		if ( type == "js" ) {
			include(path.split(".js")[0], this.checkLoad);
		} else {
			// Load a sound file using an ArrayBuffer XMLHttpRequest.
			var request = new XMLHttpRequest();
			request.open("GET", path, true);
			request.responseType = "text";
			request.onload = function(e) {
				var shader = fx.ShadersEngine._parseShader(this.responseText);
				fx.ShadersEngine.map.put(id, shader);
				fx.ShadersEngine.shadersLoaded++;
				fx.ShadersEngine.checkLoad();
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

	create: function( name, params) {
		var obj = {};
		obj.name = name;
		obj.vertex = params.vertex || "";
		obj.fragment = params.fragment || "";
		obj.options = params.options || {};
		obj.attributes = params.attributes || {};
		obj.uniforms = params.uniforms || {};
		fx.ShadersEngine.map.put( name, obj );
	},

	checkLoad: function() {
		if (fx.ShadersEngine.shadersLoaded == fx.ShadersEngine.numShaders) {
			AssetsManager.completed.shaders = true;
		}
	},

	//add method
	add: function(shader) {
		fx.ShadersEngine.shaders.push(shader);
	},
};
