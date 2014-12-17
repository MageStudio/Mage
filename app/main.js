/********************************************************************************
	MAIN SCRIPT
	copyright© 2014 Marco Stagni. http://marcostagni.com
********************************************************************************/

/********************************************************************************
	onLeapSocketConnected()

	@params null
	@output null

	@desc fired when Leap socket is connected.
********************************************************************************/

function onLeapSocketConnected() {
	l("Leap socket connected.", "i");
}

/********************************************************************************
	onLeapDeviceConnected()

	@params null
	@output null

	@desc fired when leap device is connected.
********************************************************************************/

function onLeapDeviceConnected() {
	l("Leap Device connected.", "i");
}

/********************************************************************************
	onLeapDeviceDisconnected()

	@params null
	@output null

	@desc fired when leap device is disconnected.
********************************************************************************/

function onLeapDeviceDisconnected() {
	l("Leap Device disconnected.", "i");
}

/********************************************************************************
	onCreate()

	@params null
	@output null

	@desc called when scene is created. Use this method
	to perform operations (such as adding elements) on your scene.
********************************************************************************/

var mouseX = 0, mouseY = 0, zoom = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var CAMERA_MAX_Z = 1000, CAMERA_MIN_Z = 250;

function onCreate() {

	//add your code HERE

	/********************************************************************************
		This is just an example. It shows you how to properly create a cube,
		and attach a custom script to it.

		You can see object scripts inside "app/scripts" folder. Open spaceman.js or 
		"app/scripts/cube/mybox.js" to see how a object script is made. Remember, script name and
		file name MUST be equal.

		example :

		file customBox.js
	
		Game.script("customBox", {
			start : function() {
				//always provide a start method
			},

			update : function(dt) {
				//ALWAYS provide an update method
			}
		});


	********************************************************************************/

	var geometry = new THREE.CubeGeometry(20, 20, 20);
	var material = new THREE.MeshBasicMaterial({ 
		color: 0x00ff00, 
		wireframe : true 
	});
	
	window.cube = new Mesh(geometry, material, {script : "mybox", dir : "cube"});
	window.cube2 = new Mesh(geometry, material, {script : "mybox", dir : "cube"});

	cube2.mesh.position.x = 50;

	console.log("Inside onCreate method");

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'touchstart', onDocumentTouchStart, false );
	document.addEventListener( 'touchmove', onDocumentTouchMove, false );
	document.addEventListener( 'mousewheel', onDocumentMouseWheel, false);

	//example for camera movement
	core.camera.addScript("cameraScript", "camera");

	//adding rain sound to cube
	window.rain = new AmbientSound("rain", {mesh : cube.mesh, loop : true});
	rain.start();
}

function onDocumentMouseWheel (event) {
	event.preventDefault();
	zoom = event.wheelDelta * 0.05;
	core.camera.object.position.z += zoom;
}

function onDocumentMouseMove( event ) {

	mouseX = event.clientX - windowHalfX;
	mouseY = event.clientY - windowHalfY;

}

function onDocumentTouchStart( event ) {

	if ( event.touches.length === 1 ) {

		event.preventDefault();

		mouseX = event.touches[ 0 ].pageX - windowHalfX;
		mouseY = event.touches[ 0 ].pageY - windowHalfY;

	}

}

function onDocumentTouchMove( event ) {

	if ( event.touches.length === 1 ) {

		event.preventDefault();

		mouseX = event.touches[ 0 ].pageX - windowHalfX;
		mouseY = event.touches[ 0 ].pageY - windowHalfY;

	}

}

/********************************************************************************
	progressAnimation()

	@params callback[function]
	@output null

	@desc called to perform custom progress animation when loading scene
	if not set, default progress animation will be used.
********************************************************************************/

progressAnimation = function(callback) {
	$('#loader').animate({"opacity" : "0", "margin-top" : "250px"}, 1000 , function () {
		$('#loader').remove();
		$('body').animate({backgroundColor : "#fff"}, 200 , callback);
	});
}

/********************************************************************************
	preLoad()

	@params callback[function]
	@output null

	@desc called to perform custom progress animation when loading scene
	if not set, default progress animation will be used.
********************************************************************************/

preload = function(callback) {
	//use this method to perform heavy tasks
	//loading json models
	console.log("Inside preLoad method.");
	callback();
}

/********************************************************************************
	displayMessage()

	@params message[string], type[string]
	@output null

	@desc display console messages. type can be "error", "warning", "info", or 
	null.
********************************************************************************/

function displayMessage(message, type) {
	switch(type) {
		case "error": {
			console.err(message);
		}

		case "warning": {
			console.warn(message)
		}

		case "info": {
			console.info(message)
		}

		default : {
			console.log(message);
		}

	}
}

/********************************************************************************
	input.keydown()

	@params event[object]
	@output null

	@desc fired when a key is pressed on keyboard.
********************************************************************************/

input.keydown = function(event) {
	//l(event);
};

/********************************************************************************
	input.keyup()

	@params event[object]
	@output null

	@desc fired when a key is released on keyboard.
********************************************************************************/

input.keyup = function(event) {

};

/********************************************************************************
	setUpLeap()

	@params null
	@output null

	@desc Use this to setUp your leap motion! If you don't have a leap
	motion, your app will still work fine.
********************************************************************************/

function setUpLeap() {

}

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
