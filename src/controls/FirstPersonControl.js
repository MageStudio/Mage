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

import Scene from '../core/Scene';


const CHANGE_EVENT = { type: 'change' };
const LOCK_EVENT = { type: 'lock' };
const UNLOCK_EVENT = { type: 'unlock' };

const PI_2 = Math.PI / 2;

export default class FirstPersonControl extends EventDispatcher {

    constructor(camera, domElement, options = {}) {
        super();
        
        const {
            close = 0,
            far = 1,
            position = camera.position,
            jumpSpeed = 2,
            speed = 2,
            slowDownFactor = 20,
            mass = 100,
            height = 1.8
        } = options;

        this.options = {
            close,
            far,
            position,
            jumpSpeed,
            speed,
            slowDownFactor,
            mass,
            height
        };

        this.camera = camera;
        this.camera.position.x = this.options.position.x;
        this.camera.position.y = this.options.position.y + this.options.height;
        this.camera.position.z = this.options.position.z;

        this.domElement = domElement || document.body;
        this.isLocked = false;

        this.euler = new Euler( 0, 0, 0, 'YXZ' );
        this.vector = new Vector3();

        // downwards raycaster, 0 is close, 10 is far
        this.raycaster = new Raycaster(new Vector3(), new Vector3(0, - 1, 0), close, far);
        this.headRaycaster = new Raycaster(new Vector3(), new Vector3(0, 1, 0), close, far);
        this.frontRaycaster = new Raycaster(new Vector3(), new Vector3(0, 0, -1), close, far/2);
        this.backRaycaster = new Raycaster(new Vector3(), new Vector3(0, 0, 1), close, far/2);
        this.leftRaycaster = new Raycaster(new Vector3(), new Vector3(1, 0, 0), close, far/2);
        this.rightRaycaster = new Raycaster(new Vector3(), new Vector3(-1, 0, 0), close, far/2);

        this.movingForward = false;
        this.movingBackward = false;
        this.movingLeft = false;
        this.movingRight = false;
        this.canJump = false;

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

    getObject() {
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
                if (this.canJump === true ) this.velocity.y += this.options.jumpSpeed;
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

    updateRaycasters = () => {
        this.raycaster.ray.origin.copy( this.getObject().position );
        this.raycaster.ray.origin.y -= this.options.height;

        this.headRaycaster.ray.origin.copy( this.getObject().position );
        this.headRaycaster.ray.origin.y += this.options.height;

        this.frontRaycaster.ray.origin.copy(this.getObject().position);
        this.backRaycaster.ray.origin.copy(this.getObject().position);
        this.leftRaycaster.ray.origin.copy(this.getObject().position);
        this.rightRaycaster.ray.origin.copy(this.getObject().position);
    }

    calculateCollisions = () => {
        return {
            onObject: this.raycaster.intersectObjects(Scene.getChildren(), true).length > 0,
            headCollision: this.headRaycaster.intersectObjects(Scene.getChildren(), true).length > 0,
            frontCollision: this.frontRaycaster.intersectObjects(Scene.getChildren(), true).length > 0,
            backCollision: this.backRaycaster.intersectObjects(Scene.getChildren(), true).length > 0,
            leftCollision: this.leftRaycaster.intersectObjects(Scene.getChildren(), true).length > 0,
            rightCollision: this.rightRaycaster.intersectObjects(Scene.getChildren(), true).length > 0
        }
    }

    updateVelocity = (dt) => {
        this.velocity.x -= this.velocity.x * this.options.slowDownFactor * dt;
        this.velocity.z -= this.velocity.z * this.options.slowDownFactor * dt;
        this.velocity.y -= 9.8 * this.options.mass * dt; // 100.0 = mass
    }

    updateDirection() {
        this.direction.z = Number( this.movingForward ) - Number( this.movingBackward );
        this.direction.x = Number( this.movingRight ) - Number( this.movingLeft );
        this.direction.normalize(); // this ensures consistent movements in all this.directions
    }

    update(dt) {
        if (this.isLocked) {

            this.updateRaycasters();
            const { onObject, headCollision, frontCollision, backCollision, rightCollision, leftCollision } = this.calculateCollisions();

            this.updateVelocity(dt);
            this.updateDirection();

            if ( this.movingForward || this.movingBackward ) this.velocity.z -= this.direction.z * this.options.speed * dt;
            if ( this.movingLeft || this.movingRight ) this.velocity.x -= this.direction.x * this.options.speed * dt;
            
            if (onObject) {
                this.velocity.y = Math.max( 0, this.velocity.y );
                this.canJump = true;
            } else if (headCollision && this.velocity.y > 0) {
                this.velocity.y = 0;
            }
           
            if (frontCollision && this.velocity.z < 0) {
                this.velocity.z = 0;
            } else if (backCollision && this.velocity.z > 0) {
                this.velocity.z = 0;
            }

            // if ((frontCollision || backCollision) && this.velocity.z !== 0) {
            //     this.velocity.z = 0;
            // }

            // if ((rightCollision || leftCollision) && this.velocity.x !== 0) {
            //     this.velocity.x = 0;
            // }

            this.moveRight(- this.velocity.x * dt);
            this.moveForward(- this.velocity.z * dt);
            this.getObject().position.y += (this.velocity.y * dt); // new behavior

            if (this.getObject().position.y < this.options.height) {
                this.velocity.y = 0;
                this.getObject().position.y = this.options.height;
                this.canJump = true;
            }
        }
    }
}
