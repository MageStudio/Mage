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
})();