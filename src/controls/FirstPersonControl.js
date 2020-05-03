/**
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / https://github.com/Mugen87
 */

import {
    EventDispatcher,
    Vector3,
    Euler,
    Raycaster
} from 'three';

import Scene from '../base/Scene';

const CHANGE_EVENT = { type: 'change' };
const LOCK_EVENT = { type: 'lock' };
const UNLOCK_EVENT = { type: 'unlock' };

const PI_2 = Math.PI / 2;

export default class FirstPersonControl extends EventDispatcher {

    constructor(camera, domElement) {
        super();

        this.camera = camera;
        this.camera.position.y = 10;

        this.domElement = domElement || document.body;
        this.isLocked = false;

        this.euler = new Euler( 0, 0, 0, 'YXZ' );
        this.vector = new Vector3();

        this.raycaster = new Raycaster(new Vector3(), new Vector3(0, - 1, 0), 0, 10);

		this.movingForward = false;
		this.movingBackward = false;
		this.movingLeft = false;
		this.movingRight = false;
		this.canJump = false;
		this.prevTime = performance.now();
		this.velocity = new Vector3();
		this.direction = new Vector3();
    }

    init() {
        document.addEventListener('click', this.onClick.bind(this), false);
        document.addEventListener('mousemove', this.onMouseMove.bind(this), false);
        document.addEventListener('keydown', this.onKeyDown.bind(this), false);
        document.addEventListener('keyup', this.onKeyUp.bind(this), false);
		document.addEventListener('pointerlockchange', this.onPointerlockChange.bind(this), false);
		document.addEventListener('pointerlockerror', this.onPointerlockError.bind(this), false);
    }

    dispose() {
        document.removeEventListener('click', this.onClick, false);
        document.removeEventListener('mousemove', this.onMouseMove, false);
        document.removeEventListener('keydown', this.onKeyDown, false);
        document.removeEventListener('keyup', this.onKeyUp, false);
		document.removeEventListener('pointerlockchange', this.onPointerlockChange, false);
		document.removeEventListener('pointerlockerror', this.onPointerlockError, false);

        this.unlock();
    }

    getObject() { // retaining this method for backward compatibility
		return this.camera;
	};

    getDirection = (() => {
		const direction = new Vector3(0, 0, - 1);

		return (v) => {
			return v.copy(direction).applyQuaternion(this.camera.quaternion);
		};

	})();

    onClick() {
        if (!this.isLocked) {
            this.lock();
        }
    }

    onKeyDown(event) {
		switch (event.keyCode) {
			case 38: // up
			case 87: // w
				this.movingForward = true;
				break;
			case 37: // left
			case 65: // a
				this.movingLeft = true;
				break;
			case 40: // down
			case 83: // s
				this.movingBackward = true;
				break;
			case 39: // right
			case 68: // d
				this.movingRight = true;
				break;
			case 32: // space
				if (this.canJump === true ) this.velocity.y += 350;
				this.canJump = false;
				break;
		}
	};

    onKeyUp(event) {
		switch (event.keyCode) {
			case 38: // up
			case 87: // w
				this.movingForward = false;
				break;
			case 37: // left
			case 65: // a
				this.movingLeft = false;
				break;
			case 40: // down
			case 83: // s
				this.movingBackward = false;
				break;
			case 39: // right
			case 68: // d
				this.movingRight = false;
				break;
		}
	};


    onMouseMove(event) {
		if (!this.isLocked) return;

		const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		this.euler.setFromQuaternion(this.camera.quaternion);

		this.euler.y -= movementX * 0.002;
		this.euler.x -= movementY * 0.002;

		this.euler.x = Math.max(-PI_2, Math.min(PI_2, this.euler.x));

		this.camera.quaternion.setFromEuler(this.euler);

		this.dispatchEvent(CHANGE_EVENT);
	}

    onPointerlockChange() {
		if (document.pointerLockElement === this.domElement) {
			this.dispatchEvent(LOCK_EVENT);
			this.isLocked = true;
		} else {
			this.dispatchEvent(UNLOCK_EVENT);
			this.isLocked = false;
		}
	}

    onPointerlockError(e) {
		console.error('Unable to use Pointer Lock API', e);
	}

    moveForward(distance) {
		// move forward parallel to the xz-plane
		// assumes camera.up is y-up
		this.vector.setFromMatrixColumn(this.camera.matrix, 0);
		this.vector.crossVectors(this.camera.up, this.vector);
		this.camera.position.addScaledVector(this.vector, distance);
	};

    moveRight(distance) {
		this.vector.setFromMatrixColumn(this.camera.matrix, 0);
		this.camera.position.addScaledVector(this.vector, distance);
	};

    lock() {
		this.domElement.requestPointerLock();
	};

    unlock() {
		document.exitPointerLock();
	};

    update() {
        if (this.isLocked) {
    		this.raycaster.ray.origin.copy( this.getObject().position );
    		this.raycaster.ray.origin.y -= 10;

    		const intersections = this.raycaster.intersectObjects(Scene.scene.children);
    		const onObject = intersections.length > 0;
    		const time = performance.now();
    		const delta = ( time - this.prevTime ) / 1000;

    		this.velocity.x -= this.velocity.x * 10.0 * delta;
    		this.velocity.z -= this.velocity.z * 10.0 * delta;
    		this.velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
    		this.direction.z = Number( this.movingForward ) - Number( this.movingBackward );
    		this.direction.x = Number( this.movingRight ) - Number( this.movingLeft );
    		this.direction.normalize(); // this ensures consistent movements in all this.directions

    		if ( this.movingForward || this.movingBackward ) this.velocity.z -= this.direction.z * 400.0 * delta;
    		if ( this.movingLeft || this.movingRight ) this.velocity.x -= this.direction.x * 400.0 * delta;
    		if ( onObject === true ) {
    			this.velocity.y = Math.max( 0, this.velocity.y );
    			this.canJump = true;
    		}

    		this.moveRight(- this.velocity.x * delta);
    		this.moveForward(- this.velocity.z * delta);
    		this.getObject().position.y += (this.velocity.y * delta); // new behavior

    		if (this.getObject().position.y < 10) {
    			this.velocity.y = 0;
    			this.getObject().position.y = 10;
    			this.canJump = true;
    		}
    		this.prevTime = time;
    	}
    }
}
