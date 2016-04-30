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
		parent.postMessage("Hi router from child", "http://localhost:8080");


		var geometry = new THREE.CubeGeometry(20, 20, 20);
		var material = new THREE.MeshBasicMaterial({
			color: 0xff0000,
			wireframe : true
		});

		var cube = new Mesh(geometry, material, {script : "mybox", dir : "cube"});

		console.log("Inside onCreate method");

		document.addEventListener( 'mousemove', app.onDocumentMouseMove, false );
		document.addEventListener( 'touchstart', app.onDocumentTouchStart, false );
		document.addEventListener( 'touchmove', app.onDocumentTouchMove, false );
		document.addEventListener( 'mousewheel', app.onDocumentMouseWheel, false);

		app.camera.addScript("cameraScript", "camera");
	},

	preload: function(next) {
		next();
	},

	prepareScene: function() {

	}

})._extends("App");
