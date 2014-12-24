	window.Game = {};

	Game.SCRIPTS_DIR = "app/scripts/";

	Game.update = function() {
		//console.log("inside old updateGame");
	};
	Game.script = function(name, methods) {
		//this will load our scripts
		var obj = {};
		obj.name = name;
		for (var method in methods) {
			obj[method] = methods[method];
		}
		if (!obj.start) {
			obj.start = new Function("console.log('please, add a start method');");
		}
		if (!obj.update) {
			obj.update = new Function("console.log('please, add a update method');");
		}

		if (!(name in Game.scripts)) {
			//we never created this script
			Game.scripts[name] = obj;
		}
	};
	Game.attachScriptToObject = function(object, scriptname, dir) {
		var path = dir + scriptname;
		Game.finished = false;
		include(path, function() {
			object.__loadScript(Game.scripts[scriptname]);
			Game.finished = true;
			console.log("changing game finished value " + Game.finished);
		});
		//while (!object.finished) {console.log(object.finished);}
		//while(!Game.finished){}
	}
	Game.scripts = {};
