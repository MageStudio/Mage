window.M = window.M || {};
M.fx = M.fx || {},

M.fx.particlesEngine = {

	PARTICLES_DIR : "app/particles/",

	PARTICLES: [],

	map: new HashMap(),
	particles: [],

	particles: {},
	numParticles : 0,
	particlesLoaded : 0,
	update: function() {
		//console.log("inside old update particlesEngine");
	},

	load: function() {

		if (Assets.Particles) {
			for (var particle in Assets.Particles) {
				M.fx.particlesEngine.numParticles++;
				M.fx.particlesEngine.loadSingleFile(particle, Assets.particles[particle]);
			}
		}

		if (M.fx.particlesEngine.numParticles == 0) {
			M.assetsManager.completed.particles = true;
		}
	},

	get: function(id) {
		//returning stored particle;
		return M.fx.particlesEngine.map.get(id) || false;
	},

	loadSingleFile: function(id, path) {
		// @todo this has to be changed. We can load a M.fx.createparticle file, a custom particle or a threejs particle/material.
		var type = path.split(".")[1];
		if ( type == "js" ) {
			include(path.split(".js")[0], this.checkLoad);
		} else {
			var request = new XMLHttpRequest();
			request.open("GET", path, true);
			request.responseType = "text";
			request.onload = function(e) {
				var particle = M.fx.particlesEngine._parseParticle(this.responseText);
				M.fx.particlesEngine.map.put(id, particle);
				M.fx.particlesEngine.particlesLoaded++;
				M.fx.particlesEngine.checkLoad();
			};
			request.send();
		}
	},

	_parseParticle: function(text) {
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

		M.fx.particlesEngine.PARTICLES.push(name);
		M.fx.particlesEngine.map.put( name, obj );
	},

	checkLoad: function() {
		if (M.fx.particlesEngine.particlesLoaded == M.fx.particlesEngine.numParticles) {
			M.assetsManager.completed.particles = true;
		}
	},

	//add method
	add: function(particle) {
		M.fx.particlesEngine.PARTICLES.push(particle);
	},
};