window.Control = {};
Control = {

	type : undefined,

	allowedTypes : [
						"fly",
						"fps",
						"custom"
					],

	oldType : undefined,

	handler : undefined,

	clock : undefined,

	options : {
		fps : {
			height : 5,
			mouseFactor : 0.002,
			jumpHeight : 5,
			fallFactor : 0.25,
			delta : 0.1,
			velocity : 0.5,
			crouch : 0.25
		},

		fly : {

		}
	},

	//----------------------------------------------------------------------------------------------------
	//	CHANGE CONTROL FUNCTION
	//----------------------------------------------------------------------------------------------------

	set : function (type) {
		var stringType =""+type;
		var index = Control.allowedTypes.indexOf(stringType);
		if (index != -1) {
			//vuol dire che stiamo cercando di usare un tipo ammesso.
			switch (index) {
				case 0 : {
					if (Control.oldType == 1) {
						//rimuoviamo i listener usati per fps
						//l("oldType was fps");
						//l("indexof control handler" + app.scene.children.indexOf(Control.handler.getObject()));
						document.removeEventListener( 'pointerlockchange', Control.internal_pointerlockchange, false );
						document.removeEventListener( 'mozpointerlockchange',Control.internal_pointerlockchange, false );
						document.removeEventListener( 'webkitpointerlockchange',Control.internal_pointerlockchange, false );

						document.removeEventListener( 'pointerlockerror',Control.internal_pointerlockerror, false );
						document.removeEventListener( 'mozpointerlockerror',Control.internal_pointerlockerror, false );
						document.removeEventListener( 'webkitpointerlockerror',Control.internal_pointerlockerror, false );

						document.removeEventListener( 'fullscreenchange', Control.internal_fullscreenchange, false );
						document.removeEventListener( 'mozfullscreenchange', Control.internal_fullscreenchange, false );

						document.removeEventListener( 'mousemove', Control.handler.onMouseMove, false );
						document.removeEventListener( 'keydown', Control.handler.onKeyDown, false );
						document.removeEventListener( 'keyup', Control.handler.onKeyUp, false );

						document.removeEventListener( 'click', Control.internal_pointerlockonclick, false);

						Control.handler.enabled = false;
						Control.handler = {};
						//app.scene.remove(Control.handler.getObject());


						//dobbiamo anche rimuovere l'oggetto inserito nella scena da fps.
					}
					//l("creating new fly control");
					Control.fly( app.camera.object );
					Control.type = "fly";
					Control.oldType = 0;
					break;
				}
				case 1 : {
					if (Control.oldType == 0) {
						//rimuoviamo i listener usati per fly
						//l("oldtype was fly");
						document.removeEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );

						document.removeEventListener( 'mousemove', Control.handler.mousemove, false );
						document.removeEventListener( 'mousedown', Control.handler.mousedown, false );
						document.removeEventListener( 'mouseup',   Control.handler.mouseup	, false );

						document.removeEventListener( 'keydown', Control.handler.keydown 	, false );
						document.removeEventListener( 'keyup',   Control.handler.keyup 		, false );
					}
					//l("creating new fps control");
					Control.fps( app.camera.object );
					app.add(Control.handler.getObject(), Control.handler);
					Control.fps_uuid = Control.handler.getObject().uuid;
					Control.type = "fps";
					Control.oldType = 1;
				}
			}

		}
	},



	//----------------------------------------------------------------------------------------------------
	//	FLY CONTROL
	//----------------------------------------------------------------------------------------------------

	internal_fly : function ( object, domElement ) {

		this.object = object;

		this.domElement = ( domElement !== undefined ) ? domElement : document;
		if ( domElement ) this.domElement.setAttribute( 'tabindex', -1 );

		// API

		this.movementSpeed = 1.0;
		this.rollSpeed = 0.5;

		this.dragToLook = false;
		this.autoForward = false;

		// disable default target object behavior

		// internals

		this.tmpQuaternion = new THREE.Quaternion();

		this.mouseStatus = 0;

		this.moveState = { up: 0, down: 0, left: 0, right: 0, forward: 0, back: 0, pitchUp: 0, pitchDown: 0, yawLeft: 0, yawRight: 0, rollLeft: 0, rollRight: 0 };
		this.moveVector = new THREE.Vector3( 0, 0, 0 );
		this.rotationVector = new THREE.Vector3( 0, 0, 0 );

		this.handleEvent = function ( event ) {

			if ( typeof this[ event.type ] == 'function' ) {

				this[ event.type ]( event );

			}

		};

		this.keydown = function( event ) {
			//l("keydown inside fly");
			if ( event.altKey ) {

				return;

			}

			//event.preventDefault();

			switch ( event.keyCode ) {

				case 16: /* shift */ this.movementSpeedMultiplier = .1; break;

				case 87: /*W*/ this.moveState.forward = 1; break;
				case 83: /*S*/ this.moveState.back = 1; break;

				case 65: /*A*/ this.moveState.left = 1; break;
				case 68: /*D*/ this.moveState.right = 1; break;

				case 82: /*R*/ this.moveState.up = 1; break;
				case 70: /*F*/ this.moveState.down = 1; break;

				case 38: /*up*/ this.moveState.pitchUp = 1; break;
				case 40: /*down*/ this.moveState.pitchDown = 1; break;

				case 37: /*left*/ this.moveState.yawLeft = 1; break;
				case 39: /*right*/ this.moveState.yawRight = 1; break;

				case 81: /*Q*/ this.moveState.rollLeft = 2.5; break;
				case 69: /*E*/ this.moveState.rollRight = 2.5; break;

			}

			this.updateMovementVector();
			this.updateRotationVector();

		};

		this.keyup = function( event ) {
			//l("keyup inside fly");
			switch( event.keyCode ) {

				case 16: /* shift */ this.movementSpeedMultiplier = 1; break;

				case 87: /*W*/ this.moveState.forward = 0; break;
				case 83: /*S*/ this.moveState.back = 0; break;

				case 65: /*A*/ this.moveState.left = 0; break;
				case 68: /*D*/ this.moveState.right = 0; break;

				case 82: /*R*/ this.moveState.up = 0; break;
				case 70: /*F*/ this.moveState.down = 0; break;

				case 38: /*up*/ this.moveState.pitchUp = 0; break;
				case 40: /*down*/ this.moveState.pitchDown = 0; break;

				case 37: /*left*/ this.moveState.yawLeft = 0; break;
				case 39: /*right*/ this.moveState.yawRight = 0; break;

				case 81: /*Q*/ this.moveState.rollLeft = 0; break;
				case 69: /*E*/ this.moveState.rollRight = 0; break;

			}

			this.updateMovementVector();
			this.updateRotationVector();

		};

		this.mousedown = function( event ) {
			//l("mousedown inside fly");
			if ( this.domElement !== document ) {

				this.domElement.focus();

			}

			event.preventDefault();
			event.stopPropagation();

			if ( this.dragToLook ) {

				this.mouseStatus ++;

			} else {

				switch ( event.button ) {

					case 0: this.moveState.forward = 1; break;
					case 2: this.moveState.back = 1; break;

				}

				this.updateMovementVector();

			}

		};

		this.mousemove = function( event ) {
			//l("mousemove inside fly");
			if ( !this.dragToLook || this.mouseStatus > 0 ) {

				var container = this.getContainerDimensions();
				var halfWidth  = container.size[ 0 ] / 2;
				var halfHeight = container.size[ 1 ] / 2;

				this.moveState.yawLeft   = - (( ( event.pageX - container.offset[ 0 ] ) - halfWidth  ) / halfWidth) * 3 ;
				this.moveState.pitchDown =   (( ( event.pageY - container.offset[ 1 ] ) - halfHeight ) / halfHeight) * 3;

				this.updateRotationVector();

			}

		};

		this.mouseup = function( event ) {
			//l("mouseup inside fly");
			event.preventDefault();
			event.stopPropagation();

			if ( this.dragToLook ) {

				this.mouseStatus --;

				this.moveState.yawLeft = this.moveState.pitchDown = 0;

			} else {

				switch ( event.button ) {

					case 0: this.moveState.forward = 0; break;
					case 2: this.moveState.back = 0; break;

				}

				this.updateMovementVector();

			}

			this.updateRotationVector();

		};

		this.update = function( delta ) {

			var moveMult = delta * this.movementSpeed;
			var rotMult = delta * this.rollSpeed;

			this.object.translateX( this.moveVector.x * moveMult );
			this.object.translateY( this.moveVector.y * moveMult );
			this.object.translateZ( this.moveVector.z * moveMult );

			this.tmpQuaternion.set( this.rotationVector.x * rotMult, this.rotationVector.y * rotMult, this.rotationVector.z * rotMult, 1 ).normalize();
			this.object.quaternion.multiply( this.tmpQuaternion );

			// expose the rotation vector for convenience
			this.object.rotation.setFromQuaternion( this.object.quaternion, this.object.rotation.order );


		};

		this.updateMovementVector = function() {

			var forward = ( this.moveState.forward || ( this.autoForward && !this.moveState.back ) ) ? 1 : 0;

			this.moveVector.x = ( -this.moveState.left    + this.moveState.right );
			this.moveVector.y = ( -this.moveState.down    + this.moveState.up );
			this.moveVector.z = ( -forward + this.moveState.back );

			//console.log( 'move:', [ this.moveVector.x, this.moveVector.y, this.moveVector.z ] );

		};

		this.updateRotationVector = function() {

			this.rotationVector.x = ( -this.moveState.pitchDown + this.moveState.pitchUp );
			this.rotationVector.y = ( -this.moveState.yawRight  + this.moveState.yawLeft );
			this.rotationVector.z = ( -this.moveState.rollRight + this.moveState.rollLeft );

			//console.log( 'rotate:', [ this.rotationVector.x, this.rotationVector.y, this.rotationVector.z ] );

		};

		this.getContainerDimensions = function() {

			if ( this.domElement != document ) {

				return {
					size	: [ this.domElement.offsetWidth, this.domElement.offsetHeight ],
					offset	: [ this.domElement.offsetLeft,  this.domElement.offsetTop ]
				};

			} else {

				return {
					size	: [ window.innerWidth, window.innerHeight ],
					offset	: [ 0, 0 ]
				};

			}

		};

		function bind( scope, fn ) {

			return function () {

				fn.apply( scope, arguments );

			};

		};

		this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );

		this.domElement.addEventListener( 'mousemove', bind( this, this.mousemove ), false );
		this.domElement.addEventListener( 'mousedown', bind( this, this.mousedown ), false );
		this.domElement.addEventListener( 'mouseup',   bind( this, this.mouseup ), false );

		this.domElement.addEventListener( 'keydown', bind( this, this.keydown ), false );
		this.domElement.addEventListener( 'keyup',   bind( this, this.keyup ), false );

		this.updateMovementVector();
		this.updateRotationVector();

	},

	fly : function () {
		$("body").css({"cursor":"url(img/pointer_cross.png), auto"});

		Control.handler = new Control.internal_fly( app.camera.object );

		Control.handler.movementSpeed = 3;
		Control.handler.domElement = document;
		Control.handler.rollSpeed = 0.05;
		Control.handler.autoForward = false;
		Control.handler.dragToLook = false;
	},



	//----------------------------------------------------------------------------------------------------
	//	POINTER LOCK CONTROL
	//----------------------------------------------------------------------------------------------------

	internal_pointerlockchange : function ( event ) {

		/*if ( document.pointerLockElement === document || document.mozPointerLockElement === document.body || document.webkitPointerLockElement === document.body ) {

			Control.handler.enabled = true;

		} else {

			Control.handler.enabled = false;
		}*/
		Control.handler.enabled = true;

	},

	internal_pointerlockonclick : function ( event ) {
		// Ask the browser to lock the pointer
		var element = document.body;

		element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

		if ( /Firefox/i.test( navigator.userAgent ) ) {



			document.addEventListener( 'fullscreenchange', Control.internal_fullscreenchange, false );
			document.addEventListener( 'mozfullscreenchange', Control.internal_fullscreenchange, false );

			element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

			element.requestFullscreen();

		} else {

			element.requestPointerLock();

		}
	},

	internal_pointerlockerror : function ( event ) {
		app.log("POINTER LOCK ERROR");
	},

	internal_fullscreenchange : function ( event ) {

		if ( document.fullscreenElement === document || document.mozFullscreenElement === document || document.mozFullScreenElement === document ) {

			document.removeEventListener( 'fullscreenchange', Control.internal_fullscreenchange );
			document.removeEventListener( 'mozfullscreenchange', Control.internal_fullscreenchange );

		 	document.requestPointerLock();
		}

	},

	fps_uuid : undefined,

	fps : function ( camera ) {


		Control.handler = new Control.internal_fps( app.camera.object );

		var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

		if ( havePointerLock ) {

			app.log("we have pointer lock ability");
			Control.handler.enabled = true;

			// Hook pointer lock state change events
			document.addEventListener( 'pointerlockchange', Control.internal_pointerlockchange, false );
			document.addEventListener( 'mozpointerlockchange',Control.internal_pointerlockchange, false );
			document.addEventListener( 'webkitpointerlockchange',Control.internal_pointerlockchange, false );

			document.addEventListener( 'pointerlockerror',Control.internal_pointerlockerror, false );
			document.addEventListener( 'mozpointerlockerror',Control.internal_pointerlockerror, false );
			document.addEventListener( 'webkitpointerlockerror',Control.internal_pointerlockerror, false );

			document.addEventListener( 'click', Control.internal_pointerlockonclick, false );


		} else {

			app.log("BROWSER DOESN'T SUPPORT POINTER LOCK API.");
			//instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

		}
	},
	//internal function, do not call
	internal_fps : function ( camera ) {

		var scope = this;

		camera.rotation.set( 0, 0, 0 );

		var pitchObject = new THREE.Object3D();
		pitchObject.add( camera );

		var yawObject = new THREE.Object3D();
		yawObject.position.y = Control.options.fps.height;
		yawObject.add( pitchObject );

		var moveForward = false;
		var moveBackward = false;
		var moveLeft = false;
		var moveRight = false;

		var isOnObject = false;
		var canJump = false;

		var velocity = new THREE.Vector3();

		var PI_2 = Math.PI / 2;

		var shift_clicked = false;

		//adding custom keyDownListener
		this._onKeyDown = function(event){};
		this.setKeyDownListener = function (callback) {
			this._onKeyDown = callback;
		}
		//adding custom keyUpListener
		this._onKeyUp = function(event){};
		this.setKeyUpListener = function (callback) {
			this._onKeyUp = callback;
		}
		//adding custom keyDownListener
		this._onMouseMove = function(event){};
		this.setMouseMoveListener = function (callback) {
			this._onMouseMove = callback;
		}

		this.onMouseMove = function ( event ) {

			if ( scope.enabled === false ) return;

			var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
			var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

			yawObject.rotation.y -= movementX * Control.options.fps.mouseFactor;
			pitchObject.rotation.x -= movementY * Control.options.fps.mouseFactor;

			pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );
			Control.handler._onMouseMove(event);
		};

		this.onKeyDown = function ( event ) {
			switch ( event.keyCode ) {

				case 38: // up
				case 87: // w
					moveForward = true;
					break;

				case 37: // left
				case 65: // a
					moveLeft = true;
					break;

				case 40: // down
				case 83: // s
					moveBackward = true;
					break;

				case 39: // right
				case 68: // d
					moveRight = true;
					break;

				case 32: // space
					if ( canJump === true ) velocity.y += Control.options.fps.jumpHeight;
					canJump = false;
					break;

				case 16:
					Control.options.fps._oldV = Control.options.fps.velocity;
					Control.options.fps.velocity = Control.options.fps.crouch;
					yawObject.position.y = Control.options.fps.height/2;
					canJump = false;
					shift_clicked = true;
					break;

			}
			Control.handler._onKeyDown(event);

		};

		this.onKeyUp = function ( event ) {

			switch( event.keyCode ) {

				case 38: // up
				case 87: // w
					moveForward = false;
					break;

				case 37: // left
				case 65: // a
					moveLeft = false;
					break;

				case 40: // down
				case 83: // s
					moveBackward = false;
					break;

				case 39: // right
				case 68: // d
					moveRight = false;
					break;

				case 16:
					Control.options.fps.velocity = Control.options.fps._oldV
					yawObject.position.y = Control.options.fps.height;
					canJump = true;
					shift_clicked = false;
					break;
			}
			Control.handler._onKeyUp(event);
		};

		document.addEventListener( 'mousemove', this.onMouseMove, false );
		document.addEventListener( 'keydown', this.onKeyDown, false );
		document.addEventListener( 'keyup', this.onKeyUp, false );

		this.enabled = false;

		this.getObject = function () {

			return yawObject;

		};

		this.isOnObject = function ( boolean ) {

			isOnObject = boolean;
			canJump = boolean;

		};

		this.getDirection = function() {

			// assumes the camera itself is not rotated

			var direction = new THREE.Vector3( 0, 0, -1 );
			var rotation = new THREE.Euler( 0, 0, 0, "YXZ" );

			return function( v ) {

				rotation.set( pitchObject.rotation.x, yawObject.rotation.y, 0 );

				v.copy( direction ).applyEuler( rotation );

				return v;

			}

		}();

		this.update = function ( delta ) {
			if ( scope.enabled === false )  {
				app.log("pointerlock not enabled. please enable it.");
				return;
			}

			delta *= Control.options.fps.delta;

			//velocity.x += ( - velocity.x ) * 0.08 * delta;
			//velocity.z += ( - velocity.z ) * 0.08 * delta;

			velocity.y -= Control.options.fps.fallFactor * delta; // falling down

			var V = Control.options.fps.velocity;

			if ( moveForward ) velocity.z = -V;//-= V * delta;
			if ( moveBackward ) velocity.z = V;//+= V * delta;
			if (!moveBackward && !moveForward) velocity.z = 0;

			if ( moveLeft ) velocity.x =  -V//-= V * delta;
			if ( moveRight ) velocity.x = V//+= V * delta;
			if (!moveRight && !moveLeft) velocity.x = 0;

			if ( isOnObject === true ) {

				velocity.y = Math.max( 0, velocity.y );

			}

			//yawObject.translateX( velocity.x );
			//yawObject.translateY( velocity.y );
			//yawObject.translateZ( velocity.z );

			yawObject.position.x += velocity.x;
			yawObject.position.y += velocity.y;
			yawObject.position.z += velocity.z;

			if ( yawObject.position.y < Control.options.fps.height ) {

				velocity.y = 0;
				yawObject.position.y = shift_clicked ? Control.options.fps.height/2 : Control.options.fps.height;

				canJump = true;

			} else { app.log(" vel " + velocity.y); app.log(" yawobject position y " + yawObject.position.y);}

		};

	},

	//----------------------------------------------------------------------------------------------------
	//	UPDATE AND INIT FUNCTION
	//----------------------------------------------------------------------------------------------------

	update : function () {
		//questa funzione viene chiamata ogni volta.
		/*if (input) {
			if (typeof input == "function")  {
				input();
			}
		} else {
			if (Control.handler) {
				var delta = Control.clock.getDelta();
				//if (Control.handler.update) {
					try {
						Control.handler.update(app.clock.getDelta())
					}
					catch(e) {console.error(e); console.trace();}
				//}
			}
		}*/
		if (Control.handler) {
			var delta = Control.clock.getDelta();
			//if (Control.handler.update) {
				try {
					Control.handler.update(app.clock.getDelta())
				}
				catch(e) {console.error(e); console.trace();}
			//}
		}
	},

	init : function(){
		//di default usiamo fps come metodo di movimento
		Control.clock = new THREE.Clock();
		//Control.type = "fps";
		//Control.fps( app.camera.object );
		//app.scene.add(Control.handler.getObject());
		//Control.fps_uuid = Control.handler.getObject().uuid;
		//Control.oldType = 1;
		try {
			if (app.keydown && app.keyup) {
				Control.type = "custom";
				Control.oldType = 2;
				window.addEventListener("keydown", app.keydown);
				window.addEventListener("keyup", app.keyup);
			} else {
				Control.type = "fly";
				Control.fly(app.camera.object);
				Control.oldType = 0;
			}
		} catch (e) {
			Control.type = "fly";
			Control.fly(app.camera.object);
			Control.oldType = 0;
		}


	},
}
