/********************************************************************************
	MAIN SCRIPT
	copyright© 2014 Marco Stagni. http://marcostagni.com
********************************************************************************/

include("app/scripts/cube/mybox")

Class("MyGame", {

	MyGame: function() {
		App.call(this);
	},

	onCreate: function() {
		var geometry = new THREE.CubeGeometry(20, 20, 20);
		var material = new THREE.MeshBasicMaterial({
			color: 0x00ff00,
			wireframe : true
		});

		var cube = new Mesh(geometry, material, {script : "mybox", dir : "cube"});

		console.log("Inside onCreate method");

		document.addEventListener( 'mousemove', app.onDocumentMouseMove, false );
		document.addEventListener( 'touchstart', app.onDocumentTouchStart, false );
		document.addEventListener( 'touchmove', app.onDocumentTouchMove, false );
		document.addEventListener( 'mousewheel', app.onDocumentMouseWheel, false);

		//example for camera movement
		app.camera.addScript("cameraScript", "camera");
	}

})._extends("App");

/********************************************************************************
	HELPERS

	These methods will be inside a custom core class. This is just a temporary
	solution.
********************************************************************************/

function degToRad(angle) {
	return angle * (Math.PI / 180);
}

function getProportion(max1, b, max2) {
	return (max1 * b)/max2;
}
