/********************************************************************************
	MAIN SCRIPT
	copyright© 2014 Marco Stagni. http://marcostagni.com
********************************************************************************/

include("app/scripts/cube/mybox")

Class("MyGame", {

	MyGame: function() {
		App.call(this);
		this.loader = new THREE.ObjectLoader();
	},

	onCreate: function() {

		// ricezione del messaggio dal router
		function eventListener(event) {
			console.log("inside scene");
			console.log(event);
			//event.source.postMessage("Hi, router!", event.origin);
		}
		window.addEventListener("message", eventListener, false);
		parent.postMessage("Hi router from child", "http://localhost:8080")

		var meshes = JSON.parse(app._scene.meshes);
		var models = JSON.parse(app._scene.models);
		for (var i in models) {
			meshes.push(models[i]);
		}
		var lights = JSON.parse(app._scene.lights);

		M.loader.meshes.load(meshes);
        M.loader.lights.load(lights);

		for (var i in app.scene.children) {
			if (app.scene.children[i].material) {
				app.scene.children[i].material.needsUpdate = true;
			}
		}
	},

	progressAnimation: function(next) {
		// you can provide your own version
		new Vivus("mage", {type: 'oneByOne', duration: 1000, onReady: function() {
			$('#mage').css('visibility', 'visible');
		}});
		$('#loader').delay(5000).fadeOut(1000);
		next();
	},

	preload: function(next) {
		var oReq = new XMLHttpRequest();
		oReq.addEventListener("load", function() {
			var scene = JSON.parse(this.responseText);
			app.loadScene(scene, next);
		});
		oReq.open("GET", "scene.json");
		oReq.send();
	},

	loadScene: function(scene, next) {
		app._scene = scene;
		next();
	},

	prepareScene: function() {}

})._extends("App");
