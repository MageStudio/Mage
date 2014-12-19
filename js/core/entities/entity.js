/**************************************************
	ENTITY Class
**************************************************/

Class("Entity", {

	Entity : function() {

	},

	start : function() {},

	update : function() {},

	addScript : function(scriptname, dir) {
		var path = Game.SCRIPTS_DIR + (dir || "");
		if (path[path.length - 1] != "/") {
			path += "/"; //adding dir separator if we forgot it
		}
		Game.attachScriptToObject(this, scriptname, path);
	},

	//__loadScript will be automatically called by Game object
	__loadScript : function(script) {
		for (var method in script) {
			this[method] = script[method];
		}
		this.start();
	},

	addSound : function(name, options) {
		var _autoplay = options.autoplay || false;
		this.isPlayingSound = _autoplay;
		this.sound = new Sound(name, {mesh : this.mesh , autoplay : _autoplay , effect : options.effect });
	},

	addDirectionalSound : function(name, options) {
		var _autoplay = options.autoplay || false;
		this.isPlayingSound = _autoplay;
		this.sound = new DirectionalSound(name, {mesh : this.mesh , autoplay : _autoplay , effect : options.effect});
	},

	addAmbientSound : function(name, options) {
		var _autoplay = options.autoplay || false;
		var _loop = options.loop || false;
		this.isPlayingSound = _autoplay;
		this.sound = new AmbientSound(name, {mesh : this.mesh , autoplay : _autoplay, loop : _loop , effect : options.effect});
	},

	playSound : function() {
		if (this.sound) {
			if (!this.isPlayingSound){
				this.sound.start();
				this.isPlayingSound = true;
			}
		}
	},

	stopSound : function() {
		if (this.sound) {
			if (this.isPlayingSound){
				this.sound.stop();
				this.isPlayingSound = false;
			}
		}
	}

});