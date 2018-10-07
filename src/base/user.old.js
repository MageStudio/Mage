	window.User = {};
	User = {

		real_name : undefined,
		real_surname : undefined,
		username : undefined,

		//fly control variables
		clock : undefined,

		flyControl: undefined,

		fpsControl : undefined,


		init : function() {
			User.clock = new THREE.Clock();
			/*User.flyControl = new THREE.FlyControls( app.camera );

			User.flyControl.movementSpeed = 100;
			User.flyControl.domElement = document;
			User.flyControl.rollSpeed = 0.05;
			User.flyControl.autoForward = false;
			User.flyControl.dragToLook = false;*/

			User.fpsControl = new THREE.PointerLockControls( app.camera );
			app.scene.add(User.fpsControl.getObject());
		},

		//storing current position in the universe.
		position : {
			x : undefined,
			y : undefined,
			z : undefined,

		},

		handleUserInput : function () {}
	};
