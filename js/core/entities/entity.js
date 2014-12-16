/**************************************************
	ENTITY Class
**************************************************/

Class("Entity", {

	Entity : function() {

	},

	addScript : function(scriptname, dir) {
		var path = Game.SCRIPTS_DIR + (dir || "");
		if (path[path.length - 1] != "/") {
			path += "/"; //adding dir separator if we forgot it
		}
		Game.attachScriptToObject(this, scriptname, path);
	},

	//__loadScript will be automatically called by Game object
	__loadScript : function(script) {
		this.start = script.start;
		this.start();
		this.update = script.update;
	}

});