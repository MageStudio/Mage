var license = 	"Copyright (c) 2017 by Marco Stagni < http://marcostagni.com mrc.stagni@gmail.com > and contributors.\n\nSome rights reserved. "+
					"Redistribution and use in source and binary forms, with or without\n"+
					"modification, are permitted provided that the following conditions are\n"+
					"met:\n\n"+
						"* Redistributions of source code must retain the above copyright\n"+
						"  notice, this list of conditions and the following disclaimer.\n\n"+
						"* Redistributions in binary form must reproduce the above\n"+
						"  copyright notice, this list of conditions and the following\n"+
						"  disclaimer in the documentation and/or other materials provided\n"+
						"  with the distribution.\n\n"+
						"* The names of the contributors may not be used to endorse or\n"+
						"  promote products derived from this software without specific\n"+
						"  prior written permission.\n\n"+
					"THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS\n"+
					"'AS IS' AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT\n"+
					"LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR\n"+
					"A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT\n"+
					"OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,\n"+
					"SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT\n"+
					"LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,\n"+
					"DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY\n"+
					"THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT\n"+
					"(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE\n"+
					"OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.\n\n"+
					"Mage contains third party software in the 'app/vendor' directory: each\n"+
					"file/module in this directory is distributed under its original license.\n\n";
;
window.M = window.M || {};

M.util = M.util || {};

M.util.tests = ["webgl", "webaudioapi", "webworker", "ajax"];

M.util.start = function() {
    // @see http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame    ||
              window.oRequestAnimationFrame      ||
              window.msRequestAnimationFrame     ||
              function(/* function */ callback, /* DOMElement */ element){
                window.setTimeout(callback, 1000 / 60);
              };
    })();
};

M.util.check = {
    // @todo use promises 
    start: function(onSuccess, onFailure) {
        var tests = app.util.tests || M.util.tests;

        if (tests.indexOf("webgl") == -1) {
            //we MUST pass the webgl test
            tests.push("webgl");
        }

        for (var k in tests) {
            if (M.util.tests.indexOf(tests[k]) == -1) {
                onFailure("No Such Test", tests[k]);
                return false;
            }
            if (!M.util.check[tests[k]]()) {
                onFailure("Test failed", tests[k]);
                return false;
            }
        }
        onSuccess("All systems are go!");
        return true;
    },

    webgl: function() {
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        if (!context) {
            return false;
        }
        return true;
    },

    webaudioapi: function() {
        return !!(window.webkitAudioContext || window.AudioContext);
    },

    webworker: function() {
        return !!window.Worker;
    },

    ajax: function() {
        var xhr = null;
        try { xhr = new XMLHttpRequest(); } catch (e) {}
        try { xhr = new ActiveXObject("Microsoft.XMLHTTP"); } catch (e) {}
        try { xhr = new ActiveXObject("Msxml2.XMLHTTP"); } catch (e) {}
        return (xhr!=null);
    }

};

M.util.degToRad = function(angle) {
    return angle * (Math.PI / 180);
}

M.util.getProportion = function(max1, b, max2) {
    return (max1 * b)/max2;
}
;
window.M = window.M || {};

M.control = {

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
		var stringType = "" + type,
			index = M.control.allowedTypes.indexOf(stringType);

		if (index != -1) {
			//vuol dire che stiamo cercando di usare un tipo ammesso.
			switch (index) {
				case 0 : {
					if (M.control.oldType == 1) {
						//rimuoviamo i listener usati per fps
						//l("oldType was fps");
						//l("indexof control handler" + app.scene.children.indexOf(M.control.handler.getObject()));
						document.removeEventListener( 'pointerlockchange', M.control.internal_pointerlockchange, false );
						document.removeEventListener( 'mozpointerlockchange',M.control.internal_pointerlockchange, false );
						document.removeEventListener( 'webkitpointerlockchange',M.control.internal_pointerlockchange, false );

						document.removeEventListener( 'pointerlockerror',M.control.internal_pointerlockerror, false );
						document.removeEventListener( 'mozpointerlockerror',M.control.internal_pointerlockerror, false );
						document.removeEventListener( 'webkitpointerlockerror',M.control.internal_pointerlockerror, false );

						document.removeEventListener( 'fullscreenchange', M.control.internal_fullscreenchange, false );
						document.removeEventListener( 'mozfullscreenchange', M.control.internal_fullscreenchange, false );

						document.removeEventListener( 'mousemove', M.control.handler.onMouseMove, false );
						document.removeEventListener( 'keydown', M.control.handler.onKeyDown, false );
						document.removeEventListener( 'keyup', M.control.handler.onKeyUp, false );

						document.removeEventListener( 'click', M.control.internal_pointerlockonclick, false);

						M.control.handler.enabled = false;
						M.control.handler = {};
						//app.scene.remove(M.control.handler.getObject());


						//dobbiamo anche rimuovere l'oggetto inserito nella scena da fps.
					}
					//l("creating new fly control");
					M.control.fly( app.camera.object );
					M.control.type = "fly";
					M.control.oldType = 0;
					break;
				}
				case 1 : {
					if (M.control.oldType == 0) {
						//rimuoviamo i listener usati per fly
						//l("oldtype was fly");
						document.removeEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );

						document.removeEventListener( 'mousemove', M.control.handler.mousemove, false );
						document.removeEventListener( 'mousedown', M.control.handler.mousedown, false );
						document.removeEventListener( 'mouseup',   M.control.handler.mouseup	, false );

						document.removeEventListener( 'keydown', M.control.handler.keydown 	, false );
						document.removeEventListener( 'keyup',   M.control.handler.keyup 		, false );
					}
					//l("creating new fps control");
					M.control.fps( app.camera.object );
					app.add(M.control.handler.getObject(), M.control.handler);
					M.control.fps_uuid = M.control.handler.getObject().uuid;
					M.control.type = "fps";
					M.control.oldType = 1;
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

		M.control.handler = new M.control.internal_fly( app.camera.object );

		M.control.handler.movementSpeed = 3;
		M.control.handler.domElement = document;
		M.control.handler.rollSpeed = 0.05;
		M.control.handler.autoForward = false;
		M.control.handler.dragToLook = false;
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
		M.control.handler.enabled = true;

	},

	internal_pointerlockonclick : function ( event ) {
		// Ask the browser to lock the pointer
		var element = document.body;

		element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

		if ( /Firefox/i.test( navigator.userAgent ) ) {



			document.addEventListener( 'fullscreenchange', M.control.internal_fullscreenchange, false );
			document.addEventListener( 'mozfullscreenchange', M.control.internal_fullscreenchange, false );

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

			document.removeEventListener( 'fullscreenchange', M.control.internal_fullscreenchange );
			document.removeEventListener( 'mozfullscreenchange', M.control.internal_fullscreenchange );

		 	document.requestPointerLock();
		}

	},

	fps_uuid : undefined,

	fps : function ( camera ) {


		M.control.handler = new M.control.internal_fps( app.camera.object );

		var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

		if ( havePointerLock ) {

			app.log("we have pointer lock ability");
			M.control.handler.enabled = true;

			// Hook pointer lock state change events
			document.addEventListener( 'pointerlockchange', M.control.internal_pointerlockchange, false );
			document.addEventListener( 'mozpointerlockchange',M.control.internal_pointerlockchange, false );
			document.addEventListener( 'webkitpointerlockchange',M.control.internal_pointerlockchange, false );

			document.addEventListener( 'pointerlockerror',M.control.internal_pointerlockerror, false );
			document.addEventListener( 'mozpointerlockerror',M.control.internal_pointerlockerror, false );
			document.addEventListener( 'webkitpointerlockerror',M.control.internal_pointerlockerror, false );

			document.addEventListener( 'click', M.control.internal_pointerlockonclick, false );


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
		yawObject.position.y = M.control.options.fps.height;
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

			yawObject.rotation.y -= movementX * M.control.options.fps.mouseFactor;
			pitchObject.rotation.x -= movementY * M.control.options.fps.mouseFactor;

			pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );
			M.control.handler._onMouseMove(event);
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
					if ( canJump === true ) velocity.y += M.control.options.fps.jumpHeight;
					canJump = false;
					break;

				case 16:
					M.control.options.fps._oldV = M.control.options.fps.velocity;
					M.control.options.fps.velocity = M.control.options.fps.crouch;
					yawObject.position.y = M.control.options.fps.height/2;
					canJump = false;
					shift_clicked = true;
					break;

			}
			M.control.handler._onKeyDown(event);

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
					M.control.options.fps.velocity = M.control.options.fps._oldV
					yawObject.position.y = M.control.options.fps.height;
					canJump = true;
					shift_clicked = false;
					break;
			}
			M.control.handler._onKeyUp(event);
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

			delta *= M.control.options.fps.delta;

			//velocity.x += ( - velocity.x ) * 0.08 * delta;
			//velocity.z += ( - velocity.z ) * 0.08 * delta;

			velocity.y -= M.control.options.fps.fallFactor * delta; // falling down

			var V = M.control.options.fps.velocity;

			if ( moveForward ) velocity.z = -V;//-= V * delta;
			if ( moveBackward ) velocity.z = V;//+= V * delta;
			if (!moveBackward && !moveForward) velocity.z = 0;

			if ( moveLeft ) velocity.x =  -V//-= V * delta;
			if ( moveRight ) velocity.x = V//+= V * delta;
			if (!moveRight && !moveLeft) velocity.x = 0;

			if ( isOnObject === true ) {

				velocity.y = Math.max( 0, velocity.y );

			}

			yawObject.translateX( velocity.x );
			yawObject.translateY( velocity.y );
			yawObject.translateZ( velocity.z );

			//yawObject.position.x += velocity.x;
			//yawObject.position.y += velocity.y;
			//yawObject.position.z += velocity.z;

			if ( yawObject.position.y < M.control.options.fps.height ) {

				velocity.y = 0;
				yawObject.position.y = shift_clicked ? M.control.options.fps.height/2 : M.control.options.fps.height;

				canJump = true;

			} //else { app.log(" vel " + velocity.y); app.log(" yawobject position y " + yawObject.position.y);}

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
		if (M.control.handler) {
			var delta = M.control.clock.getDelta();
			//if (Control.handler.update) {
				try {
					M.control.handler.update(app.clock.getDelta())
				}
				catch(e) {console.error(e); console.trace();}
			//}
		}
	},

	init : function(){
		//di default usiamo fps come metodo di movimento
		M.control.clock = new THREE.Clock();
		//M.control.type = "fps";
		//M.control.fps( app.camera.object );
		//app.scene.add(M.control.handler.getObject());
		//M.control.fps_uuid = M.control.handler.getObject().uuid;
		//M.control.oldType = 1;
		try {
			if (app.keydown && app.keyup) {
				M.control.type = "custom";
				M.control.oldType = 2;
				window.addEventListener("keydown", app.keydown);
				window.addEventListener("keyup", app.keyup);
			} else {
				M.control.type = "fly";
				M.control.fly(app.camera.object);
				M.control.oldType = 0;
			}
		} catch (e) {
			M.control.type = "fly";
			M.control.fly(app.camera.object);
			M.control.oldType = 0;
		}


	},
}
;
window.M = window.M || {};

M.game = {
	scripts: {}
};

M.game.SCRIPTS_DIR = "app/scripts/";

M.game.update = function() {
	//console.log("inside old updateGame");
};

M.game.script = function(name, methods) {
	//this will load our scripts
	var obj = {};
	obj.name = name;
	for (var method in methods) {
		obj[method] = methods[method];
	}
	if (!obj.start) {
		obj.start = new Function("console.warn('You need a start method');");
	}
	if (!obj.update) {
		obj.update = new Function("console.warn('You need an update method');");
	}

	if (!(name in M.game.scripts)) {
		//we never created this script
		M.game.scripts[name] = obj;
	}
};

M.game.attachScriptToObject = function(object, scriptname, dir) {
	var path = dir + scriptname;
	include(path, function() {
		object.__loadScript(M.game.scripts[scriptname]);
	});
};;
window.M = window.M || {};

M.gui = {

	miniMap : undefined,

	menu : undefined,

	init : function() {
		
	}
};

M.gui.init();;
window.M = window.M || {};

M.universe =  {

	reality : undefined,

	loaded : false,

	worker : undefined,

	bigbang : function(){
		console.log("inside universe init");

		M.universe.loaded = true;
		M.universe.reality = new HashMap();
	},

	testingShaders : function() {
		// create a wireframe material
		//shader ha bisogno di uniforms


		var material = new THREE.ShaderMaterial( {
			uniforms: {
				tExplosion: {
				  type: "t",
				  value: THREE.ImageUtils.loadTexture( 'img/explosion.png' , {}, function(t) {
					console.log(t);
				  })
				},
				time: {
				  type: "f",
				  value: 0.0
				}
			},
			vertexShader: document.getElementById( 'vertexShader' ).textContent,
			fragmentShader: document.getElementById( 'fragmentShader' ).textContent
		} );

		// create a sphere and assign the material
		var mesh = new THREE.Mesh(
			new THREE.IcosahedronGeometry( 20, 4 ),
			material
		);

		mesh.start_time = Date.now();

		mesh.auto_render = function() {

			this.material.uniforms[ 'time' ].value = .00025 * ( Date.now() - this.start_time);
		}
		app.scene.add( mesh );
		M.universe.reality.put(mesh.uuid, mesh);

	},

	addPlanetAndSatellite : function () {

		var material = new THREE.MeshBasicMaterial( { color: 0xffffff , wireframe : true } );
		var geometry = new THREE.SphereGeometry(15, 40, 40);
		geometry.dynamic = true;


		var planet = new THREE.Mesh(geometry, material);

		planet.position.x = 0;
		planet.position.y = 0;
		planet.position.z = 0;



		//addding render function
		planet.auto_render = function () {
			this.rotation.y += 0.0001;
		}

		//adding to the scene and to our map.
		app.scene.add( planet );
		M.universe.reality.put(planet.uuid, planet);

		//stampiamo la geometry appena settata
		l("PLANET GEOMETRY");
		l(planet.geometry.dynamic + " - " + planet.geometry.verticesNeedUpdate + " - " + planet.geometry.normalsNeedUpdate);

		//satellite
		var material = new THREE.MeshBasicMaterial( { color: 0xffffff , wireframe : true } );
		var satellite = new THREE.Mesh(new THREE.SphereGeometry(30, 40, 40), material);

		satellite.position.x = 0;
		satellite.position.y = 400;
		satellite.position.z = 0;

		//addding render function
		satellite.auto_render = function () {

			this.position.x +=
			this.position.z +=

			this.rotation.y += 0.0001;
		}


	},

	update : function () {

		var keys_list = M.universe.reality.keys.concat();
		if (keys_list.length != 0) {
			var start = +new Date();
			do {
				var o = M.universe.reality.get(keys_list.shift());
				if (o.update) {
					o.update(app.clock.getDelta());
				}
			} while (keys_list.length > 0 && (+new Date() - start < 50));
		}
		
	}
};

M.universe.bigbang();
;
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



		handleUserInput : function () {
			/*------------------------------------------------------------------------------------------

				right here, we are going to user data stored with onkeypress event and onmousemove event
				to update camera position and to move our player. render will move our player according
				to our data.

			------------------------------------------------------------------------------------------*/
		}
	};
;
Class("Beat", {

	Beat : function(name) {
		this.name = name;
		//this sound name should already be loaded by our engine
		this.sound = {};
		this.sound.source = M.audioEngine.context.createBufferSource();
		this.sound.volume = M.audioEngine.context.createGain();
		this.sound.volume.gain.value = M.audioEngine.VOLUME;

		//setting listeners
		this.setListeners();

		// Connect the sound source to the volume control.
		this.sound.source.connect(this.sound.volume);
		// Hook up the sound volume control to the main volume.
		this.sound.volume.connect(M.audioEngine.volume);
	},

	setListeners : function() {
		//setting listeners
		this.sound.source._caller = this;
		//this.sound.source.onended = this.onEnd;
		//this.sound.source.loopEnd = this.onLoopEnd;
		//this.sound.source.loopStart = this.onLoopstart; 
	},

	reset : function() {
		this.sound.source.disconnect();
		this.sound.source = M.audioEngine.context.createBufferSource();
		this.sound.source.connect(this.sound.volume);
		//setting listeners
		this.setListeners();
	},

	start : function() {
		var buffer = M.audioEngine.get(this.name);
		if (!buffer) {
			console.error("Unable to load sound, sorry.");
			return;
		}
		this.sound.source.buffer = buffer;
		this.sound.volume.gain.value = 0;
		this.sound.source.start(M.audioEngine.context.currentTime);
		var self = this;
		var _delay = function() {
			self.sound.volume.gain.value = self.sound.volume.gain.value + M.audioEngine.DELAY_FACTOR;
			if (self.sound.volume.gain.value < M.audioEngine.DELAY_NORMAL_VALUE) {
				setTimeout(_delay, M.audioEngine.DELAY_STEP);
			}
		}
		_delay();
	},

	stop : function() {
		var self = this;
		var _delay = function() {
			self.sound.volume.gain.value = self.sound.volume.gain.value - M.audioEngine.DELAY_FACTOR;
			if (self.sound.volume.gain.value > M.audioEngine.DELAY_MIN_VALUE) {
				setTimeout(_delay, M.audioEngine.DELAY_STEP);
			} else {
				self.sound.source.stop();
			}
		}
		_delay();
	},

	onEnd : function() {
		if (this._caller.onEndCallback) {
			this._caller.onEndCallback();
		}
		this._caller.reset();
	},

	onLoopEnd : function() {
		if (this._caller.onLoopEndCallback) {
			this._caller.onLoopEndCallback();
		}
	},

	onLoopStart : function() {
		if (this._caller.onLoopStartCallback) {
			this._caller.onLoopStartCallback();
		}
	}
	
});;
Class("Sound", {

	Sound : function(name, opt) {
		Beat.call(this, name);
		var options = opt || {};
		//creating panner, we need to update on object movements.
		this.sound.panner = M.audioEngine.context.createPanner();
		//disconnecting from main volume, then connecting to panner and main volume again
		this.sound.volume.disconnect();
		this.sound.volume.connect(this.sound.panner);
		this.sound.panner.connect(M.audioEngine.volume);

		if (options.mesh) {
			this.mesh = options.mesh;
		} else {
			this.update = function() {};
		}

		if (options.effect) {

			this.convolver = M.audioEngine.context.createConvolver();
			this.mixer = M.audioEngine.createGain();
			this.sound.panner.disconnect();
			this.sound.panner.connect(this.mixer);
			//creating gains
			this.plainGain = M.audioEngine.context.createGain();
			this.convolverGain = M.audioEngine.context.createGain();
			//connect mixer to new gains
			this.mixer.connect(plainGain);
			this.mixer.connect(convolverGain);

			this.plainGain.connect(M.audioEngine.volume);
			this.convolverGain.connect(M.audioEngine.volume);

			this.convolver.buffer = M.audioEngine.get(options.effect);
			this.convolverGain.gain.value = 0.7;
			this.plainGain.gain.value = 0.3;

		}
		//autoplay option
		var autoplay = options.autoplay || false;
		if (autoplay) {
			this.start();
		}
		//setting listeners if provided
		//this.onEndCallback = options.onEnd || new Function();
		//this.onLoopStartCallback = options.onLoopStart || new Function();
		//this.onLoopEndCallback = options.onLoopEnd || new Function();

		//adding this sound to AudioEngine
		M.audioEngine.add(this);
	},

	update : function(dt) {

		if (this.mesh) {
			var p = new THREE.Vector3();
			p.setFromMatrixPosition(this.mesh.matrixWorld);
			var px = p.x, py = p.y, pz = p.z;

			this.mesh.updateMatrixWorld();

			var q = new THREE.Vector3();
			q.setFromMatrixPosition(this.mesh.matrixWorld);
			var dx = q.x-px, dy = q.y-py, dz = q.z-pz;
			//setting panner position and velocity using doppler effect.
			try {
				this.sound.panner.setPosition(q.x, q.y, q.z);
				this.sound.panner.setVelocity(dx/dt, dy/dt, dz/dt);
			} catch (e) {
				// quick and dirty solution.
			}
		}
	}

})._extends("Beat");;
Class("AmbientSound", {
	
	AmbientSound : function(name, options) {
		Beat.call(this, name);
		//use options to choose whether have a loop or not.
		this.sound.source.loop = options.loop || false;
		
		//creating panner, we need to update on object movements.
		this.sound.panner = M.audioEngine.context.createPanner();
		//disconnecting from main volume, then connecting to panner and main volume again
		this.sound.volume.disconnect();
		this.sound.volume.connect(this.sound.panner);
		this.sound.panner.connect(M.audioEngine.volume);

		//storing mesh
		this.mesh = options.mesh;

		//if we set up an effect in our options, we need to create a convolver node
		if (options.effect) {

			this.convolver = M.audioEngine.context.createConvolver();
			this.mixer = M.audioEngine.context.createGain();
			this.sound.panner.disconnect();
			this.sound.panner.connect(this.mixer);
			//creating gains
			this.plainGain = M.audioEngine.context.createGain();
			this.convolverGain = AudioEngine.context.createGain();
			//connect mixer to new gains
			this.mixer.connect(plainGain);
			this.mixer.connect(convolverGain);

			this.plainGain.connect(M.audioEngine.volume);
			this.convolverGain.connect(M.audioEngine.volume);

			this.convolver.buffer = M.audioEngine.get(options.effect);
			this.convolverGain.gain.value = 0.7;
			this.plainGain.gain.value = 0.3;

		}
		//autoplay option
		var autoplay = options.autoplay || false;
		if (autoplay) {
			this.start();
		}
		//adding this sound to AudioEngine
		M.audioEngine.add(this);
	},

	update : function(dt) {

		// In the frame handler function, get the object's position.
		this.mesh.updateMatrixWorld();
		var p = new THREE.Vector3();
		p.setFromMatrixPosition(this.mesh.matrixWorld);

		// And copy the position over to the sound of the object.
		this.sound.panner.setPosition(p.x, p.y, p.z);
	}

})._extends("Beat");;
Class("DirectionalSound", {

	DirectionalSound : function(name, angles, options) {
		Beat.call(this, name);

		//creating panner, we need to update on object movements.
		this.sound.panner = M.audioEngine.context.createPanner();
		//disconnecting from main volume, then connecting to panner and main volume again
		this.sound.volume.disconnect();
		this.sound.volume.connect(this.sound.panner);
		this.sound.panner.connect(M.audioEngine.volume);

		//storing mesh
		this.mesh = options.mesh;
		//storing direction
		this.sound.panner.coneInnerAngle = angles.innerAngleInDegrees;
		this.sound.panner.coneOuterAngle = angles.outerAngleInDegrees;
		this.sound.panner.coneOuterGain = angles.outerGainFactor;
		
		if (options.effect) {

			this.convolver = M.audioEngine.context.createConvolver();
			this.mixer = M.audioEngine.createGain();
			this.sound.panner.disconnect();
			this.sound.panner.connect(this.mixer);
			//creating gains
			this.plainGain = M.audioEngine.context.createGain();
			this.convolverGain = M.audioEngine.context.createGain();
			//connect mixer to new gains
			this.mixer.connect(plainGain);
			this.mixer.connect(convolverGain);

			this.plainGain.connect(M.audioEngine.volume);
			this.convolverGain.connect(M.audioEngine.volume);

			this.convolver.buffer = M.audioEngine.get(options.effect);
			this.convolverGain.gain.value = 0.7;
			this.plainGain.gain.value = 0.3;

		}
		//autoplay option
		var autoplay = options.autoplay || false;
		if (autoplay) {
			this.start();
		}
		//adding this sound to AudioEngine
		M.audioEngine.add(this);
	},

	update : function(dt) {

		var p = new THREE.Vector3();
		p.setFromMatrixPosition(this.mesh.matrixWorld);
		var px = p.x, py = p.y, pz = p.z;

		this.mesh.updateMatrixWorld();

		var q = new THREE.Vector3();
		q.setFromMatrixPosition(this.mesh.matrixWorld);
		var dx = q.x-px, dy = q.y-py, dz = q.z-pz;
		//setting panner position and velocity using doppler effect.
		this.sound.panner.setPosition(q.x, q.y, q.z);
		this.sound.panner.setVelocity(dx/dt, dy/dt, dz/dt);


		var vec = new THREE.Vector3(0,0,1);
		var m = this.mesh.matrixWorld;

		// Save the translation column and zero it.
		var mx = m.elements[12], my = m.elements[13], mz = m.elements[14];
		m.elements[12] = m.elements[13] = m.elements[14] = 0;

		// Multiply the 0,0,1 vector by the world matrix and normalize the result.
		vec.applyProjection(m);
		vec.normalize();

		this.sound.panner.setOrientation(vec.x, vec.y, vec.z);

		// Restore the translation column.
		m.elements[12] = mx;
		m.elements[13] = my;
		m.elements[14] = mz;

	}

})._extends("Beat");;
Class("BackgroundSound", {
    
    BackgroundSound : function(name, options) {
        Beat.call(this, name);
        //use options to choose whether have a loop or not.
        this.sound.source.loop = options.loop || true;
        
        //no need to create panner, nor to disconnect volume.

        //storing mesh
        this.mesh = options.mesh;

        //if we set up an effect in our options, we need to create a convolver node
        if (options.effect) {

            this.convolver = M.audioEngine.context.createConvolver();
            this.mixer = M.audioEngine.context.createGain();
            this.sound.panner.disconnect();
            this.sound.panner.connect(this.mixer);
            //creating gains
            this.plainGain = M.audioEngine.context.createGain();
            this.convolverGain = M.audioEngine.context.createGain();
            //connect mixer to new gains
            this.mixer.connect(plainGain);
            this.mixer.connect(convolverGain);

            this.plainGain.connect(M.audioEngine.volume);
            this.convolverGain.connect(M.audioEngine.volume);

            this.convolver.buffer = M.audioEngine.get(options.effect);
            this.convolverGain.gain.value = 0.7;
            this.plainGain.gain.value = 0.3;

        }
        //autoplay option
        var autoplay = options.autoplay || true;
        if (autoplay) {
            this.start();
        }
        //adding this sound to AudioEngine
        M.audioEngine.add(this);
    },

    update : function(dt) {}

})._extends("Beat");;
Class("Shader", {
    Shader: function( name, attributes, uniforms, options ) {
        this.shader = M.fx.shadersEngine.get( name );
        if (!this.shader.instance) {
          this.name = this.shader.name;
          this.vertex = this.shader.vertex;
          this.fragment = this.shader.fragment;
          this.attributes = attributes ? attributes : this.shader.attributes;
          this.uniforms = uniforms ? uniforms : this.shader.uniforms;
          //creating shader options
          var object = {
            'attributes': this.attributes,
            'uniforms': this.uniforms,
            'vertexShader': this.shader.vertex,
            'fragmentShader': this.shader.fragment
          };
          //storing user options in shader options
          var opt = options ? options : this.shader.options;
          for ( o in opt ) {
            object[o] = opt[o];
          }
          //creating the actual material
          this.material = new THREE.ShaderMaterial( object );
        }
    }
});

// todo: fix also this one.
;
/**
 * @author James Baicoianu / http://www.baicoianu.com/
 */

THREE.FlyControls = function ( object, domElement ) {

	this.object = object;

	this.domElement = ( domElement !== undefined ) ? domElement : document;
	if ( domElement ) this.domElement.setAttribute( 'tabindex', -1 );

	// API

	this.movementSpeed = 1.0;
	this.rollSpeed = 0.005;

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

			case 81: /*Q*/ this.moveState.rollLeft = 1; break;
			case 69: /*E*/ this.moveState.rollRight = 1; break;

		}

		this.updateMovementVector();
		this.updateRotationVector();

	};

	this.keyup = function( event ) {

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

		if ( !this.dragToLook || this.mouseStatus > 0 ) {

			var container = this.getContainerDimensions();
			var halfWidth  = container.size[ 0 ] / 2;
			var halfHeight = container.size[ 1 ] / 2;

			this.moveState.yawLeft   = - ( ( event.pageX - container.offset[ 0 ] ) - halfWidth  ) / halfWidth;
			this.moveState.pitchDown =   ( ( event.pageY - container.offset[ 1 ] ) - halfHeight ) / halfHeight;

			this.updateRotationVector();

		}

	};

	this.mouseup = function( event ) {

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

};
;
/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.PointerLockControls = function ( camera ) {

	var scope = this;

	camera.rotation.set( 0, 0, 0 );

	var pitchObject = new THREE.Object3D();
	pitchObject.add( camera );

	var yawObject = new THREE.Object3D();
	yawObject.position.y = 10;
	yawObject.add( pitchObject );

	var moveForward = false;
	var moveBackward = false;
	var moveLeft = false;
	var moveRight = false;

	var isOnObject = false;
	var canJump = false;

	var velocity = new THREE.Vector3();

	var PI_2 = Math.PI / 2;

	var onMouseMove = function ( event ) {

		if ( scope.enabled === false ) return;

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		yawObject.rotation.y -= movementX * 0.002;
		pitchObject.rotation.x -= movementY * 0.002;

		pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );

	};

	var onKeyDown = function ( event ) {
		l("inside pointer lock controls onKeyDown " + event.keyCode);
		switch ( event.keyCode ) {

			case 38: // up
			case 87: // w
				moveForward = true;
				break;

			case 37: // left
			case 65: // a
				moveLeft = true; break;

			case 40: // down
			case 83: // s
				moveBackward = true;
				break;

			case 39: // right
			case 68: // d
				moveRight = true;
				break;

			case 32: // space
				if ( canJump === true ) velocity.y += 10;
				canJump = false;
				break;

		}

	};

	var onKeyUp = function ( event ) {

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

		}

	};

	document.addEventListener( 'mousemove', onMouseMove, false );
	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup', onKeyUp, false );

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
			l("pointerlock not enabled. please enable it.");
			return;
		}

		delta *= 0.1;

		//velocity.x += ( - velocity.x ) * 0.08 * delta;
		//velocity.z += ( - velocity.z ) * 0.08 * delta;

		velocity.y -= 0.25 * delta;

		var V = 0.1;

		if ( moveForward ) velocity.z = -V;//-= V * delta;
		if ( moveBackward ) velocity.z = V;//+= V * delta;
		if (!moveBackward && !moveForward) velocity.z = 0;

		if ( moveLeft ) velocity.x =  -V//-= V * delta;
		if ( moveRight ) velocity.x = V//+= V * delta;
		if (!moveRight && !moveLeft) velocity.x = 0;

		if ( isOnObject === true ) {

			velocity.y = Math.max( 0, velocity.y );

		}

		yawObject.translateX( velocity.x );
		yawObject.translateY( velocity.y ); 
		yawObject.translateZ( velocity.z );

		if ( yawObject.position.y < 10 ) {

			velocity.y = 0;
			yawObject.position.y = 10;

			canJump = true;

		}

	};

};
;
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
;
/**************************************************
		Camera CLASS
**************************************************/

Class("Camera", {

	Camera : function(options) {
		Entity.call(this);
		this.options = options;
		this.object = new THREE.PerspectiveCamera(options.fov, options.ratio , options.near, options.far );
		//adding to core
	},

})._extends("Entity");;
/**************************************************
		MESH CLASS
**************************************************/

Class("Mesh", {

	Mesh : function(geometry, material, options) {
		Entity.call(this);
		this.geometry = geometry;
		this.material = material;
		this.script = {};
		this.hasScript = false;

		this.mesh = new THREE.Mesh(geometry, material);
		if (app.util.cast_shadow) {
			this.mesh.castShadow = true;
			this.mesh.receiveShadow = true;
		}
		//adding to core
		app.add(this.mesh, this);

		if (options) {
			//do something with options
			for (var o in options) {
				this[o] = options[o];
				if (o == "script") {
					this.hasScript = true;
					this.addScript(options[o], options.dir);
				}
			}
		}
	}

})._extends("Entity");
;
Class("ShaderMesh", {

    ShaderMesh : function(geometry, name, attributes, uniforms, options) {
        Entity.call(this);
        this.geometry = geometry;
        this.attributes = attributes;
        this.uniforms = uniforms;
        this.shaderName = name;
        var shader = new Shader(this.shaderName, this.attributes, this.uniforms, options);
        if (!shader.instance) {
            if ( !attributes ) {
                this.attributes = shader.attributes;
            }
            if ( !uniforms ) {
                this.uniforms = shader.uniforms;
            }
            this.script = {};
            this.hasScript = false;

            this.mesh = new THREE.Mesh(geometry, shader.material);
        } else {
            this.mesh = shader.instance(app.renderer, app.camera.object, app.scene, options);
        }
        
        //adding to core
        app.add(this.mesh, this);

        if (options) {
            //do something with options
            for (var o in options) {
                this[o] = options[o];
                if (o == "script") {
                    this.hasScript = true;
                    this.addScript(options[o], options.dir);
                }
            }
        }
    }

})._extends("Entity");
;
/**************************************************
		Animated MESH CLASS
**************************************************/
/*
Class("AnimatedMesh", {

    AnimatedMesh : function(geometry, material, options) {

		Entity.call(this);

        var ensureLoop = function(animation) {
            for ( var i = 0; i < animation.hierarchy.length; i ++ ) {

				var bone = animation.hierarchy[ i ];

				var first = bone.keys[ 0 ];
				var last = bone.keys[ bone.keys.length - 1 ];

				last.pos = first.pos;
				last.rot = first.rot;
				last.scl = first.scl;

			}
        };

        ensureLoop( geometry.animation );

		this.geometry = geometry;
		this.material = material;
		this.script = {};
		this.hasScript = false;

        this.geometry.computeBoundingBox();
        var boundBox = this.geometry.boundingBox;
		this.mesh = new THREE.SkinnedMesh(geometry, material);
		//adding to core
		app.add(this.mesh, this);

        //creating skeleton helper
        this.helper = new THREE.SkeletonHelper( this.mesh );
		this.helper.material.linewidth = 3;
		this.helper.visible = true;
		app.add( this.helper, this.helper );

        //creating animation
        this.animation = new THREE.Animation( this.mesh, this.geometry.animation );
	    this.animation.play();

		if (options) {
			//do something with options
			for (var o in options) {
				this[o] = options[o];
				if (o == "script") {
					this.hasScript = true;
					this.addScript(options[o], options.dir);
				}
			}
		}

	},

    update: function() {
        this.animate();
    },

    animate: function() {

        var delta = app.clock.getDelta() * 0.75;
        THREE.AnimationHandler.update(delta);
        if (this.helper) {
            this.helper.update();
        }

    }

})._extends("Entity");
*/
/**
 * @author Michael Guerrero / http://realitymeltdown.com
 */
Class("AnimatedMesh",  {

    AnimatedMesh: function(geometry, materials, options) {

        Entity.call(this);

        this.animations = {};
        this.weightSchedule = [];
        this.warpSchedule = [];


        var originalMaterial = materials[0];
        originalMaterial.skinning = true;

        this.meshVisible = true;
        this.mesh = new THREE.SkinnedMesh(geometry, originalMaterial);
        this.mesh.visible = this.meshVisible;
        app.add(this.mesh, this);


        //storing animations
        for ( var i = 0; i < geometry.animations.length; ++i ) {
            var animName = geometry.animations[ i ].name;
            this.animations[animName] = new THREE.Animation(this.mesh, geometry.animations[i]);
        }

        //creating skeleton
        this.skeleton = new THREE.SkeletonHelper(this.mesh);
        this.skeleton.material.linediwth = 3;
        this.mesh.add(this.skeleton);

        this.skeletonVisible = false;
        this.skeleton.visible = this.skeletonVisible;

        if (options) {
			//do something with options
			for (var o in options) {
				this[o] = options[o];
				if (o == "script") {
					this.hasScript = true;
					this.addScript(options[o], options.dir);
				}
			}
		}

    },

    toggleSkeleton: function() {

        this.skeletonVisible = !this.skeletonVisible;
        this.skeleton.visible = this.skeletonVisible;
    },


	toggleModel: function() {

        this.meshVisible = !this.meshVisible;
        this.mesh.visible = this.meshVisible;

	},

    setWeights: function(weights) {

        for (name in weights) {
            if (this.animations[name]) {
                this.animations[name].weight = weights[name];
            }
        }
    },

    update: function(dt) {
        this.animate(dt);
    },

    animate: function(dt) {

        for ( var i = this.weightSchedule.length - 1; i >= 0; --i ) {

			var data = this.weightSchedule[ i ];
			data.timeElapsed += dt;

			// If the transition is complete, remove it from the schedule
			if ( data.timeElapsed > data.duration ) {

				data.anim.weight = data.endWeight;
				this.weightSchedule.splice( i, 1 );

				// If we've faded out completely, stop the animation

				if ( data.anim.weight == 0 ) {

					data.anim.stop( 0 );

				}

			} else {

				// interpolate the weight for the current time
				data.anim.weight = data.startWeight + (data.endWeight - data.startWeight) * data.timeElapsed / data.duration;

			}

		}

		this.updateWarps( dt );
		this.skeleton.update();
        THREE.AnimationHandler.update(dt);

    },

    updateWarps: function(dt) {
        // Warping modifies the time scale over time to make 2 animations of different
		// lengths match. This is useful for smoothing out transitions that get out of
		// phase such as between a walk and run cycle

		for ( var i = this.warpSchedule.length - 1; i >= 0; --i ) {

			var data = this.warpSchedule[ i ];
			data.timeElapsed += dt;

			if ( data.timeElapsed > data.duration ) {

				data.to.weight = 1;
				data.to.timeScale = 1;
				data.from.weight = 0;
				data.from.timeScale = 1;
				data.from.stop( 0 );

				this.warpSchedule.splice( i, 1 );

			} else {

				var alpha = data.timeElapsed / data.duration;

				var fromLength = data.from.data.length;
				var toLength = data.to.data.length;

				var fromToRatio = fromLength / toLength;
				var toFromRatio = toLength / fromLength;

				// scale from each time proportionally to the other animation

				data.from.timeScale = ( 1 - alpha ) + fromToRatio * alpha;
				data.to.timeScale = alpha + toFromRatio * ( 1 - alpha );

				data.from.weight = 1 - alpha;
				data.to.weight = alpha;

			}

		}

    },

    play: function(animName) {

        var weight = this.animations[animName].weight === undefined ? this.animations[animName] : 1;
		this.animations[animName].play(0, weight);

	},

	crossfade: function(fromAnimName, toAnimName, duration) {

		var fromAnim = this.animations[fromAnimName];
		var toAnim = this.animations[toAnimName];

		fromAnim.play( 0, 1 );
		toAnim.play( 0, 0 );

		this.weightSchedule.push( {

			anim: fromAnim,
			startWeight: 1,
			endWeight: 0,
			timeElapsed: 0,
			duration: duration

		} );

		this.weightSchedule.push( {

			anim: toAnim,
			startWeight: 0,
			endWeight: 1,
			timeElapsed: 0,
			duration: duration

		} );

	},

	warp: function( fromAnimName, toAnimName, duration ) {

		var fromAnim = this.animations[fromAnimName];
		var toAnim = this.animations[toAnimName];

		fromAnim.play( 0, 1 );
		toAnim.play( 0, 0 );

		this.warpSchedule.push( {

			from: fromAnim,
			to: toAnim,
			timeElapsed: 0,
			duration: duration

		} );

	},

	applyWeight: function(animName, weight) {

		this.animations[ animName ].weight = weight;

	},

	pauseAll: function() {

		for ( var a in this.animations ) {

			if ( this.animations[ a ].isPlaying ) {

				this.animations[ a ].stop();

			}

		}

	},

	unPauseAll: function() {

    	for ( var a in this.animations ) {

    	  if ( this.animations[ a ].isPlaying && this.animations[ a ].isPaused ) {

    		this.animations[ a ].pause();

    	  }

    	}

    },


    stopAll: function() {

		for ( a in this.animations ) {

			if ( this.animations[ a ].isPlaying ) {
				this.animations[ a ].stop(0);
			}

			this.animations[ a ].weight = 0;

		}

		this.weightSchedule.length = 0;
		this.warpSchedule.length = 0;

	},

    getForward: function() {

        var forward = new THREE.Vector3();

        return function() {

            // pull the character's forward basis vector out of the matrix
            forward.set(
                -this.matrix.elements[ 8 ],
                -this.matrix.elements[ 9 ],
                -this.matrix.elements[ 10 ]
            );

            return forward;
        }

    }

})._extends("Entity");
;
Class("Light", {

	Light : function(color, intensity, position) {
		//this.mesh = new THREE.AmbientLight(color);
		//app.add(this.mesh, this);
		Entity.call(this);
		this.color = color;
		this.intensity = intensity;
		this.position = position || {
			x: 0,
			y: 0,
			z: 0
		};
		this.isLightOn = false;
		this.mesh = undefined;
		M.lightEngine.add(this);
	},

	on: function() {
		if (this.light) {
			var self = this;
			var _delay = function() {
				self.light.intensity += M.lightEngine.delayFactor;
				if (self.light.intensity < self.intensity) {
					setTimeout(_delay, M.lightEngine.delayStep);
				} else {
					self.isLightOn = true;
				}
			}
			_delay();
		} else {
			console.log("You should create your light, first");
		}
	},

	off: function() {
		if (this.light) {
			var self = this;
			var _delay = function() {
				self.light.intensity -= M.lightEngine.delayFactor;
				if (self.light.intensity > 0) {
					setTimeout(_delay, M.lightEngine.delayStep);
				} else {
					self.isLightOn = false;
				}
			}
			_delay();
		} else {
			console.log("You should create your light, first");
		}
	}

})._extends("Entity");
;
Class("AmbientLight", {

    AmbientLight : function(color, _intensity, _position) {
        var intensity = _intensity ? _intensity : 1,
            position = _position ? _position : new THREE.Vector3(0, 0, 0);
        Light.call(this, color, intensity, position);
        this.light = new THREE.AmbientLight(color);
        app.add(this.light, this);
    }

})._extends("Light");
;
Class("PointLight", {

    PointLight: function(color, intensity, distance, position) {

        Light.call(this, color, intensity, position);

        this.geometry = new THREE.SphereGeometry( M.lightEngine.holderRadius, M.lightEngine.holderSegment, M.lightEngine.holderSegment );
        this.material = new THREE.MeshPhongMaterial({color: this.color});
        this.mesh = new Mesh( this.geometry, this.material );
        this.light = new THREE.PointLight(color, intensity, distance);
        this.mesh.mesh.position.set(this.position.x, this.position.y, this.position.z);
        this.light.position = this.mesh.mesh.position;
        this.mesh.mesh.add(this.light);

    }

})._extends("Light");
;
Class("DirectionalLight", {

    DirectionalLight: function(color, intensity, distance, position, target) {

        Light.call(this, color, intensity, position);

        //this.geometry = new THREE.SphereGeometry( LightEngine.holderRadius, LightEngine.holderSegment, LightEngine.holderSegment );
        //this.material = new THREE.MeshPhongMaterial({color: this.color});
        //this.mesh = new Mesh( this.geometry, this.material );
        this.light = new THREE.DirectionalLight(color, intensity);

        //this.mesh.mesh.position.set(this.position.x, this.position.y, this.position.z);

        if (target) {
            this.light.target.position.copy(target.position);
        }

        this.light.position.set(position.x, position.y, position.z);

        this.light.castShadow = true;

		this.light.shadow.mapSize.width = 512;
		this.light.shadow.mapSize.height = 512;

		var d = 300;

		this.light.shadow.camera.left = -d;
		this.light.shadow.camera.right = d;
		this.light.shadow.camera.top = d;
		this.light.shadow.camera.bottom = -d;

		this.light.shadow.camera.far = 1000;
        //this.mesh.mesh.add(this.light);
        app.add(this.light, this);

    }

})._extends("Light");
;
window.M = window.M || {};

M.loader = M.loader = {}; 

M.loader.lights = {
    load: function(lights) {
        for (var j=0; j<lights.length; j++) {
            var current = lights[j]
                parsedLight = M.loader.lights._parseLight(current);

            if (current.light.object.type == "DirectionalLight") {
                M.loader.lights._loadDirectionalLight(parsedLight);
            } else if (current.light.object.type == "AmbientLight") {
                M.loader.lights._loadAmbientLight(parsedLight);
            } else if (current.light.object.type == "PointLight") {
                M.loader.lights._loadPointLight(parsedLight);
            }
        }
    },

    _parseLight: function(light) {
        return {
            holder: (light.holder) ? app.loader.parse(light.holder) : false,
            target: (light.target) ? app.loader.parse(light.target) : false,
            light: (light.light) ? app.loader.parse(light.light) : false
        };
    },

    _loadDirectionalLight: function(light) {
        new DirectionalLight(light.light.color, light.light.intensity, light.light.distance, light.light.position, light.target);
    },

    _loadAmbientLight: function(light) {
        new AmbientLight(light.light.color, light.light.intensity, light.light.position);
    },

    _loadPointLight: function(light) {
        var d = 200;
        var position = light.holder ? light.holder.position : light.light.position;
        var pointlight = new PointLight(light.light.color, light.light.intensity, d, position);
        pointlight.light.castShadow = true;
        pointlight.light.shadow.camera.left = -d;
        pointlight.light.shadow.camera.right = d;
        pointlight.light.shadow.camera.top = d;
        pointlight.light.shadow.camera.bottom = -d;
        pointlight.light.shadow.camera.far = app.util.camera.far;
        pointlight.light.shadow.darkness = 0.2;
    }
}
;
window.M = window.M || {};

M.loader = M.loader = {}; 

M.loader.meshes = {
    load: function(meshes) {
        for (var i=0; i<meshes.length; i++) {
			var current = meshes[i],
                script = M.loader.meshes._parseScript(current),
                parsedMesh = M.loader.meshes._parseMesh(current);

			if (parsedMesh.name.indexOf('_camera') > -1) {
				M.loader.meshes._loadCamera(parsedMesh, script);
			} else {
                M.loader.meshes._loadMesh(parsedMesh, script);
			}
        }
    },

    _parseMesh: function(mesh) {
        return this.loader.parse(mesh);
    },

    _parseScript: function(mesh) {
        var script = mesh.object.userData ? mesh.object.userData['script'] : false,
            dir = false,
            file = false;
        if (script) {
            script = script.slice(script.lastIndexOf('scripts/') + 8);
            dir = script.slice(0, script.indexOf('/')),
            file = script.slice(script.indexOf('/') + 1);
        }

        return {
            script: script,
            dir: dir,
            file: file
        };
    },

    _loadCamera: function(mesh, script) {
        var camType = mesh.name.replace('_', '').toLowerCase();
        if (app.camera.object.type.toLowerCase() === camType) {
            app.camera.object.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
            app.camera.object.rotation.set(mesh.rotation.x, mesh.rotation.y, mesh.rotation.z);
            app.camera.object.scale.set(mesh.scale.x, mesh.scale.y, mesh.scale.z);

            M.loader.meshes._attachScript(app.camera, script);
        }
    },

    _loadMesh: function(parsedMesh, script) {
        parsedMesh.castShadow = true;
        parsedMesh.receiveShadow = true;
        var mesh = new Mesh(parsedMesh.geometry, parsedMesh.material);
        mesh.mesh.position.set(parsedMesh.position.x, parsedMesh.position.y, parsedMesh.position.z);
        mesh.mesh.rotation.set(parsedMesh.rotation.x, parsedMesh.rotation.y, parsedMesh.rotation.z);
        mesh.mesh.scale.set(parsedMesh.scale.x, parsedMesh.scale.y, parsedMesh.scale.z);
        mesh.mesh.castShadow = true;
        mesh.mesh.receiveShadow = true;
        // setting texture
        if (current.textureKey) {
            var texture = M.imagesEngine.get(current.textureKey);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(1, 1);
            mesh.mesh.material.map = texture;
        }

        M.loader.meshes._attachScript(mesh, script);
    },

    _attachScript: function(mesh, script) {
        if (script.dir && script.file) {
            mesh.addScript(script.file.replace('.js', ''), script.dir);
        }
    }
}
