(function() {
	window.Game = {};

	Game.SCRIPTS_DIR = "app/scripts/";

	Game.update = function() {
		//console.log("inside old updateGame");
	};
	Game.script = function(name, methods) {
		//this will load our scripts
		var obj = {};
		obj.name = name;
		obj.start = methods.start || new Function("console.log('please, add a start method');");
		obj.update = methods.update || new Function("console.log('please, add an update method');");

		if (!(name in Game.scripts)) {
			//we never created this script
			Game.scripts[name] = obj;
		}
	};
	Game.attachScriptToObject = function(object, scriptname, dir) {
		var path = dir + scriptname;
		include(path, function() {
			object.__loadScript(Game.scripts[scriptname]);
		});
	}
	Game.scripts = {};

	/**************************************************
		MESH CLASS
	**************************************************/

	Class("Mesh", {
		Mesh : function(geometry, material, options) {
			this.geometry = geometry;
			this.material = material;
			this.script = {};
			this.hasScript = false;

			this.mesh = new THREE.Mesh(geometry, material);
			//adding to core
			core.add(this);

			if (options) {
				//do something with options
				for (var o in options) {
					this[o] = options[o];
					if (o == "script") {
						this.hasScript = true;
						var dir = Game.SCRIPTS_DIR + (options.dir || "");
						if (dir[dir.length - 1] != "/") {
							dir += "/"; //adding dir separator if we forgot it
						}
						this.__attachScript(options[o], dir);
					}
				}
			}
		},

		__attachScript : function(scriptname, dir) {
			Game.attachScriptToObject(this, scriptname, dir);
		},

		__loadScript : function(script) {
			this.start = script.start;
			this.start();
			this.update = script.update;
		}
	});
})();