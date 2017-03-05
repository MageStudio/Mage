/**************************************************
	ENTITY Class
**************************************************/

Class("Entity", {

	Entity : function() {

	},

	start : function() {},

	update : function() {},

	addScript : function(scriptname, dir) {
		var path = M.game.SCRIPTS_DIR + (dir || "");
		if (path[path.length - 1] != "/") {
			path += "/"; //adding dir separator if we forgot it
		}
		M.game.attachScriptToObject(this, scriptname, path);
	},

	//__loadScript will be automatically called by Game object
	__loadScript : function(script) {
		for (var method in script) {
			this[method] = script[method];
		}
		try {
			this.start()
		} catch(e) {
			console.log("I told you, man. Check your start method inside your " + script.name + ".js script");
		}
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

	addMesh: function( mesh ) {

		this.mesh.add( mesh );

	},

	addLight: function( color, intensity, distance ) {

		var position = {
			x: this.mesh.position.x,
			y: this.mesh.position.y,
			z: this.mesh.position.z
		}
		this.light = new PointLight( color, intensity, distance, position );
		this.addMesh( this.light.mesh.mesh );

	},

	playSound : function() {

		if ( this.sound ) {
			if (!this.isPlayingSound){
				this.sound.start();
				this.isPlayingSound = true;
			}
		}

	},

	stopSound : function() {

		if ( this.sound ) {
			if (this.isPlayingSound){
				this.sound.stop();
				this.isPlayingSound = false;
			}
		}

	},

	scale: function(x, y, z) {
		if (this.mesh) {
			this.mesh.scale.set(x, y, z);
		}
	}

});
