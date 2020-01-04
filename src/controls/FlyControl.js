/**
 * @author James Baicoianu / http://www.baicoianu.com/
 */

import {
	Quaternion,
	Vector3,
    EventDispatcher
} from 'three';

export default class FlyControl extends EventDispatcher {

    constructor(object, domElement) {
        super();

        this.domElement = domElement || document;
        this.object = object;

    	if (domElement) this.domElement.setAttribute('tabindex', -1);

    	// API
    	this.movementSpeed = 100;
    	this.rollSpeed = Math.PI / 24;

    	this.dragToLook = true;
    	this.autoForward = true;

    	// disable default target object behavior

    	// internals
    	this.tmpQuaternion = new Quaternion();

    	this.mouseStatus = 0;

    	this.moveState = {
            up: 0,
            down: 0,
            left: 0,
            right: 0,
            forward: 0,
            back: 0,
            pitchUp: 0,
            pitchDown: 0,
            yawLeft: 0,
            yawRight: 0,
            rollLeft: 0,
            rollRight: 0
        };
    	this.moveVector = new Vector3(0, 0, 0);
    	this.rotationVector = new Vector3(0, 0, 0);
    }

    init = () => {
        this.domElement.addEventListener('contextmenu', this.onContextMenu, false);

    	this.domElement.addEventListener('mousemove', this.onMouseMove, false);
    	this.domElement.addEventListener('mousedown', this.onMouseDown, false);
    	this.domElement.addEventListener('mouseup', this.onMouseUp, false);

    	window.addEventListener('keydown', this.onKeyDown, false);
    	window.addEventListener('keyup', this.onKeyUp, false);

    	this.updateMovementVector();
    	this.updateRotationVector();
    }

    dispose = () => {
		this.domElement.removeEventListener('contextmenu', this.onContextMenu, false);
		this.domElement.removeEventListener('mousedown', this.onMouseDown, false);
		this.domElement.removeEventListener('mousemove', this.onMoudeMove, false);
		this.domElement.removeEventListener('mouseup', this.onMouseUp, false);

		window.removeEventListener('keydown', this.onKeyDown, false);
		window.removeEventListener('keyup', this.onKeyUp, false);
	};

    onKeyDown = (event) => {

		if (event.altKey) {
			return;
		}

		//event.preventDefault();

		switch (event.keyCode) {
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

        console.log(this.moveVector);
	};

    onKeyUp = (event) => {
        switch (event.keyCode) {

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
    }

    onMouseDown = (event) => {
        if (this.domElement !== document) {
			this.domElement.focus();
		}

		event.preventDefault();
		event.stopPropagation();

		if (this.dragToLook) {
			this.mouseStatus++;
		} else {
			switch(event.button) {
				case 0: this.moveState.forward = 1; break;
				case 2: this.moveState.back = 1; break;
			}
			this.updateMovementVector();
		}
    }

    onMouseMove = (event) => {
        if (!this.dragToLook || this.mouseStatus > 0) {

			const container = this.getContainerDimensions();
			const halfWidth = container.size[ 0 ] / 2;
			const halfHeight = container.size[ 1 ] / 2;

			this.moveState.yawLeft = - ((event.pageX - container.offset[0]) - halfWidth) / halfWidth;
			this.moveState.pitchDown = ((event.pageY - container.offset[1]) - halfHeight) / halfHeight;

			this.updateRotationVector();
		}
    }

    onMouseUp = (event) => {
        event.preventDefault();
		event.stopPropagation();

		if (this.dragToLook) {
			this.mouseStatus--;
			this.moveState.yawLeft = this.moveState.pitchDown = 0;
		} else {
			switch (event.button) {
				case 0: this.moveState.forward = 0; break;
				case 2: this.moveState.back = 0; break;
			}
			this.updateMovementVector();
		}
		this.updateRotationVector();
    }

    onContextMenu = (event) => event.preventDefault();

    update = (delta) => {
        const moveMult = delta * this.movementSpeed;
		const rotMult = delta * this.rollSpeed;

		this.object.translateX(this.moveVector.x * moveMult);
		this.object.translateY(this.moveVector.y * moveMult);
		this.object.translateZ(this.moveVector.z * moveMult);

		this.tmpQuaternion.set(this.rotationVector.x * rotMult, this.rotationVector.y * rotMult, this.rotationVector.z * rotMult, 1).normalize();
		this.object.quaternion.multiply(this.tmpQuaternion);

		// expose the rotation vector for convenience
		this.object.rotation.setFromQuaternion(this.object.quaternion, this.object.rotation.order);
    }

    updateMovementVector = () => {
		const forward = (this.moveState.forward || ( this.autoForward && ! this.moveState.back)) ? 1 : 0;

		this.moveVector.x = (-this.moveState.left + this.moveState.right);
		this.moveVector.y = (-this.moveState.down + this.moveState.up);
		this.moveVector.z = (-forward + this.moveState.back);
	};

    updateRotationVector = () => {
		this.rotationVector.x = (-this.moveState.pitchDown + this.moveState.pitchUp);
		this.rotationVector.y = (-this.moveState.yawRight + this.moveState.yawLeft);
		this.rotationVector.z = (-this.moveState.rollRight + this.moveState.rollLeft);
	};

    getContainerDimensions = () => {

		if (this.domElement != document) {

			return {
				size: [this.domElement.offsetWidth, this.domElement.offsetHeight],
				offset: [this.domElement.offsetLeft, this.domElement.offsetTop]
			};

		} else {

			return {
				size: [window.innerWidth, window.innerHeight],
				offset: [0, 0]
			};

		}

	};
}
