/////////////////
// TWEEN CLASS //
/////////////////

function ParticleTween(timeArray, valueArray)
{
	this.times  = timeArray || [];
	this.values = valueArray || [];
}

ParticleTween.prototype.lerp = function(t)
{
	var i = 0;
	var n = this.times.length;
	while (i < n && t > this.times[i])  
		i++;
	if (i == 0) return this.values[0];
	if (i == n)	return this.values[n-1];
	var p = (t - this.times[i-1]) / (this.times[i] - this.times[i-1]);
	if (this.values[0] instanceof THREE.Vector3)
		return this.values[i-1].clone().lerp( this.values[i], p );
	else // its a float
		return this.values[i-1] + p * (this.values[i] - this.values[i-1]);
}

var core = {};

var onCreate = function() {};
var load = function() {};
var preload = function(callback) {callback();};
var prepareScene = function() {};
var progressAnimation = function(callback) {
	$('#loader').animate({"opacity" : "0", "margin-top" : "250px"}, 1000 , function () {
		$('#loader').remove();	
		$('body').animate({backgroundColor : "#fff"}, 200 , callback);
	});
}
var customRender = function() {};
var input = function() {};
input.keydown = function() {};
input.keyup = function() {};

var _util = {
	log_types : {
		"e" : "error",
		"w" : "warn",
		"i" : "info"
	}
};

function l () {
	if (core.debug) {
		if (arguments.length>1) {
			if (arguments[1] in _util.log_types) {
				console[_util.log_types[arguments[1]]](arguments[0]);
			} else {
				console.log(arguments[0]);
			}
		} else {
			console.log(arguments[0]);
		}
	}
}



core = {

	baseLib 	: "js/lib",
	baseUtil 	: "js/lib/util", 

	modules : [
		"js/lib/underscore",
		"js/lib/OBJLoader",
		"js/lib/jquery.color.min",
		"js/lib/tween",
		"js/lib/physi",
		"js/lib/ammo",
		"js/lib/ParticleEngine",
		"js/lib/ParticleEngineExamples",
		"js/core/util/classy",
		"js/core/util/colors",
		"js/core/controls/FlyControl",
		"js/core/controls/PointerLockControls",
		"js/core/game",
		"js/core/universe",
		"js/core/user",
		"js/core/control",
		"js/core/gui"
	],

	util : {
		h : window.innerHeight,
		w : window.innerWidth,
		ratio : (window.innerWidth/window.innerHeight),
		frameRate : 60,

		camera : {
			//handling useful informations about our camera.
			fov : 75,
			near : 0.1,
			far : 100
		}
	},
	//importing libraries
	threeLib : undefined,

	//scnee parameters
	camera 	: undefined,
	user 	: undefined,
	scene 	: undefined,
	renderer: undefined,

	//debug mode
	debug : true,

	clock : new THREE.Clock(),

	//first thing that will be called.
	//this is to create s new black scene
	render : function () {
		/*------------------------------------------------------------------------------------------	
			
			this is part of our game loop. this is used to update every game object
			we are going to use our universe object to handle every updates.

		------------------------------------------------------------------------------------------*/
		
		//if ((User.handleUserInput instanceof Function ) && (User.handleUserInput)) {
			setTimeout(User.handleUserInput, 0);
		//}

		/*------------------------------------------------------------------------------------------

			now we are going to check our game state. using game.updateGame() function.

		------------------------------------------------------------------------------------------*/

		//if ((Game.updateGame instanceof Function )&&(Game.updateGame)) {
			setTimeout(Game.updateGame, 0);
		//}

		/*------------------------------------------------------------------------------------------

			it's now time to perform our scene render.
			we are going to use our universe object so we can add more elements to the scene, 
			erase elements and set our world just before render.

		------------------------------------------------------------------------------------------*/
		
		//if ((Universe.updateUniverse instanceof Function)&&(Universe.updateUniverse)) {
			//setTimeout(Universe.updateUniverse, 0);
			Universe.updateUniverse();
		//}

		//update our control updater
		//if (Control.update) {

			setTimeout(Control.update, 0);

		//}

		//l("inside render function");
		//requestAnimationFrame(core.render);

		//updating camera if we need to do so.
		if (core.camera._render) {
			core.camera._render();
		} 

		setTimeout(function() {
			if (config.physics_enabled) {
				if (Physijs._isLoaded) {
					core.scene.simulate();
				}	
			}
			if (config.tween_enabled) {
				TWEEN.update();
			}
			requestAnimationFrame(core.render);
		}, 1000 / core.util.frameRate);
		core.renderer.autoClear = false;
		core.renderer.clear();
		customRender();
		core.renderer.render(core.scene, core.camera);
	},

	add : function(element) {
		//method to be called when creating a new element
		core.scene.add(element);
		Universe.universe.put(element.uuid, element);
	},

	remove : function(element) {
		core.scene.remove(element);
		Universe.universe.remove(element.uuid);
	},

	main_progress_bar : undefined,

	init : (function () {

		var requirejsScript = document.createElement("script");
		requirejsScript.src = "js/lib/require.js";
		requirejsScript.async = false;
		document.getElementsByTagName('head')[0].appendChild(requirejsScript);

		var createScene = function () {
			//this is like having imports.
			core.threeLib = THREE;
			var c_util 	= core.util.camera; //camera util
			var util 	= core.util;
			var t 		= core.threeLib;

			try{
				//l("about to create new scene");
				//configuring threejs and physijs
				if (config) {
					l("config loaded");
					if (config.physics_enabled) {
						l("physics enabled.");
						try {
							Physijs.scripts.worker = '/js/lib/workers/physijs_worker.js';
							Physijs.scripts.ammo = '/js/lib/ammo.js';
							core.scene = new Physijs.Scene();
							Physijs._isLoaded = true;
						} catch (ex) {
							l("something bad trying to create physijs scene", "e");
							l(ex);
							Physijs._isLoaded = false;
							core.scene = new t.Scene();
						}
					} else {
						l("physics not enabled.");
						Physijs._isLoaded = false;
						core.scene = new t.Scene();	
					}
				} else {
					l("config not loaded, switching to three.js");
					Physijs._isLoaded = false;
					core.scene = new t.Scene();
				}
				var fov = c_util.fov, ratio = util.ratio, near = c_util.near, far = c_util.far;
				if (config) {
					if (config.camera) {
						fov = config.camera.fov ? config.camera.fov : fov;
						ratio = config.camera.ratio ? config.camera.ratio : ratio;
						near = config.camera.near ? config.camera.near : near;
						far = config.camera.far ? config.camera.far : far;
					}
				}
				core.camera = new t.PerspectiveCamera(fov, ratio ,near, far );
				core.renderer = new t.WebGLRenderer({alpha:false});
				if (config) {
					if (config.cast_shadow == true) {
						core.renderer.shadowMapEnabled = true;
						core.renderer.shadowMapType = THREE.PCFSoftShadowMap;
					}
				}
				core.renderer.setSize( util.w , util.h );
				//document.body.appendChild( core.renderer.domElement );
				document.getElementById("gameContainer").appendChild(core.renderer.domElement);
				/*------------------------------------------------------------------------------------------
					
					trying to retrieve user input. from keyboard, mouse and joystick.
					we're going to add leap motion as available controller.

				------------------------------------------------------------------------------------------*/


				//if ((User.handleUserInput instanceof Function ) && (User.handleUserInput)) {
					User.handleUserInput();
				//} 

				/*------------------------------------------------------------------------------------------

					now we are going to check our game state. using game.updateGame() function.

				------------------------------------------------------------------------------------------*/

				//if ((Game.updateGame instanceof Function )&&(Game.updateGame)) {
					Game.updateGame();
				//}

				/*------------------------------------------------------------------------------------------
				
					now it's time to add elements to my scene.
					we must handle a "universe" object that will know the exact number of elements to be
					drawn on our screen. each object must have a method called : 'render()' so that
					every universe object will be rendered automatically.

				------------------------------------------------------------------------------------------*/

				//if ((Universe.updateUniverse instanceof Function)&&(Universe.updateUniverse)) {
					Universe.updateUniverse();
				//}

				/*------------------------------------------------------------------------------------------
					
					we can now launch our render function.

				------------------------------------------------------------------------------------------*/
				Control.init();
				core.render();

				//we are pretty sure we can add stuff to our universe
				if (onCreate instanceof Function) {
					onCreate();
				} else {
					console.log("Something wrong in your onCreate method");
				}

			} catch( error ) {
				console.log(error);
			//	console.log("ERROR OCCURRED while trying to create scene: " + error );
			} 

		}

		load = function() {
			core.main_progress_bar = document.getElementById("progress_bar");
			console.log("inside load");
			if (!(typeof progressAnimation == "function")) {
				progressAnimation = function(callback) {
					console.log("def progressAnimation");
					callback();
				}
			}
			requirejs(core.modules, progressAnimation(createScene));			
		};
		window.onload = function() {
			console.log("inside window onload");
			preload(function() {
				prepareScene();
				load();
			});
		}
		window.onresize = function() {

			core.util.h 	= window.innerHeight;
			core.util.w 	= window.innerWidth;
			core.util.ratio = core.util.w/core.util.h;

			core.camera.aspect = core.util.ratio;
			core.camera.updateProjectionMatrix();
			core.renderer.setSize(core.util.w, core.util.h);

		};

	})(),

	
}