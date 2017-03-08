window.M = window.M || {};

M.game = {
	scripts: {}
};

M.game.SCRIPTS_DIR = "app/scripts/";

M.game.update = function() {
	//console.log("inside old updateGame");
};

M.game.script = function(name, methods) {
	//this will load our scripts
	var obj = {};
	obj.name = name;
	for (var method in methods) {
		obj[method] = methods[method];
	}
	if (!obj.start) {
		obj.start = new Function("console.warn('You need a start method');");
	}
	if (!obj.update) {
		obj.update = new Function("console.warn('You need an update method');");
	}

	if (!(name in M.game.scripts)) {
		//we never created this script
		M.game.scripts[name] = obj;
	}
};

M.game.attachScriptToObject = function(object, scriptname, dir) {
	var path = dir + scriptname;
	include(path, function() {
		object.__loadScript(M.game.scripts[scriptname]);
	});
};