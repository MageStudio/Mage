/**
 * @author mrdoob / http://mrdoob.com/
 */

import {
    Vector3,
    Vector2,
    Spherical,
    Quaternion,
    Object3D,
    MOUSE,
    EventDispatcher
} from 'three';

const PI_2 = Math.PI / 2;

export default class FIrstPersonControl extends EventDispatcher {

    constructor(camera) {
        this._camera = camera;

    }

    init() {
        // setting listeners on this.domElement
        // calling this.update once
    }

    onMouseMove = (event) => {
        if (!this.enabled) return;

		const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		this.yawObject.rotation.y -= movementX * 0.002;
		this.pitchObject.rotation.x -= movementY * 0.002;

		this.pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, this.pitchObject.rotation.x ) );
    }

    onKeyDown = ({ keyCode }) => {
        switch (keyCode) {
			case 38: // up
			case 87: // w
				this.moveForward = true;
				break;

			case 37: // left
			case 65: // a
				this.moveLeft = true;
                break;

			case 40: // down
			case 83: // s
				this.moveBackward = true;
				break;

			case 39: // right
			case 68: // d
				this.moveRight = true;
				break;

			case 32: // space
				if (this.canJump) {
                    this.velocity.y += 10;
                }
				this.canJump = false;
				break;
		}
    }

    onKeyUp = ({ keyCode }) => {
        switch(keyCode) {

            case 38: // up
            case 87: // w
                this.moveForward = false;
                break;

            case 37: // left
            case 65: // a
                this.moveLeft = false;
                break;

            case 40: // down
            case 83: // s
                this.moveBackward = false;
                break;

            case 39: // right
            case 68: // d
                this.moveRight = false;
                break;

        }
    }
}


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


	var onMouseMove = function ( event ) {



	};

	var onKeyDown = function ( event ) {
		l("inside pointer lock controls onKeyDown " + event.keyCode);


	};

	var onKeyUp = function ( event ) {



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
