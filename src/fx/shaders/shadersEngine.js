window.fx.ShadersEngine = {

	SHADERS_DIR : "app/shaders/",

	shaders: {},
	numShaders : 0,
	shadersLoaded : 0,
	update: function() {
		//console.log("inside old update ShadersEngine");
	},

	load : function() {

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

	get : function(id) {
		//returning stored shader;
		return fx.ShadersEngine.map.get(id) || false;
	},

	loadSingleFile : function(id, path) {
		// Load a sound file using an ArrayBuffer XMLHttpRequest.
		var request = new XMLHttpRequest();
		request.open("GET", path, true);
		request.responseType = "text";
		request.onload = function(e) {
			var shader = fx.ShadersEngine._parseShader(this.responseText);
			fx.ShadersEngine.map.put(id, shader);
		};
		request.send();
	},

	_parseShader: function(text) {
		var obj = {};
		obj.name = text.substring(text.indexOf("<name>")+6, text.indexOf("</name>"));
		obj.vertex = text.substring(text.indexOf("<vertex>")+8, text.indexOf("</vertex>"));
		obj.fragment = text.substring(text.indexOf("<fragment>")+10, text.indexOf("</fragment>"));
		return obj;
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
