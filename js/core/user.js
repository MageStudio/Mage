(function(){
	window.User = {};
	User = {
		/*------------------------------------------------------------------------------------------

			this object will contain almost every information about our user game state
			it will also contain every method necessary to retrieve user input and to know which 
			of controller is being user.

			this object will override native window user input handling.

		------------------------------------------------------------------------------------------*/

		real_name : undefined,
		real_surname : undefined,
		username : undefined,

		//fly control variables
		clock : undefined,

		flyControl: undefined,

		fpsControl : undefined,

		
		init : function() {
			User.clock = new THREE.Clock();
			/*User.flyControl = new THREE.FlyControls( core.camera );

			User.flyControl.movementSpeed = 100;
			User.flyControl.domElement = document;
			User.flyControl.rollSpeed = 0.05;
			User.flyControl.autoForward = false;
			User.flyControl.dragToLook = false;*/

			User.fpsControl = new THREE.PointerLockControls( core.camera );
			core.scene.add(User.fpsControl.getObject());

			

		},

		//storing current position in the universe.
		position : {

			x : undefined,
			y : undefined,
			z : undefined,

		},

		

		handleUserInput : function () {
			/*------------------------------------------------------------------------------------------

				right here, we are going to user data stored with onkeypress event and onmousemove event
				to update camera position and to move our player. render will move our player according 
				to our data.

			------------------------------------------------------------------------------------------*/
		}
	};
})();