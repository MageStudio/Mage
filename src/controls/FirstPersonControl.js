/**
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / https://github.com/Mugen87
 */

import {
    EventDispatcher,
    Vector3,
    Euler,
    Raycaster,
    Quaternion
} from 'three';

import Scene from '../core/Scene';
import { debounce } from '../lib/functions';
import { PHYSICS_ELEMENT_MISSING } from '../lib/messages';

import Physics from '../physics';

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
            height = 1.8,
            sensitivity = 0.002,
            target = null,
            physicsEnabled = false
        } = options;

        this.options = {
            close,
            far,
            position,
            jumpSpeed,
            speed,
            slowDownFactor,
            sensitivity,
            mass,
            height,
            target,
            physicsEnabled
        };

        this.camera = camera;
        if (!target) {
            this.camera.setPosition({ x: this.options.position.x, y: this.options.position.y + this.options.height, z: this.options.position.z});
        } else {
            this.camera.setPosition({ x: 0, y: this.options.height, z: 0 });
        }

        this.character = target;

        this.domElement = domElement || document.body;
        this.isLocked = false;

        this.euler = new Euler( 0, 0, 0, 'YXZ' );
        this.vector = new Vector3();

        // downwards raycaster, 0 is close, 10 is far
        this.raycaster = new Raycaster(new Vector3(), new Vector3(0, -1, 0), close, far);
        this.headRaycaster = new Raycaster(new Vector3(), new Vector3(0, 1, 0), close, far);

        this.movement = {};
        this.movement.forward = false;
        this.movement.backwards = false;
        this.movement.left = false;
        this.movement.right = false;
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

    hasPhysicsEnabled = () => this.options.physicsEnabled;

    getCharacter() {
        // FirstPersonControl will either control a character or the camera.
        return this.character || this.camera;
    };

    getDirection = (() => {
        const direction = new Vector3(0, 0, - 1);

        return (v) => {
            return v.copy(direction).applyQuaternion(this.camera.getQuaternion());
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
                this.movement.forward = true;
                break;
            case 37: // left
            case 65: // a
                this.movement.left = true;
                break;
            case 40: // down
            case 83: // s
                this.movement.backwards = true;
                break;
            case 39: // right
            case 68: // d
                this.movement.right = true;
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
                this.movement.forward = false;
                break;
            case 37: // left
            case 65: // a
                this.movement.left = false;
                break;
            case 40: // down
            case 83: // s
                this.movement.backwards = false;
                break;
            case 39: // right
            case 68: // d
                this.movement.right = false;
                break;
        }
    };


    onMouseMove(event) {
        if (!this.isLocked) return;

        const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
        const quaternion = this.camera.getQuaternion();

        this.euler.setFromQuaternion(quaternion);

        this.euler.y -= movementX * this.options.sensitivity;
        this.euler.x -= movementY * this.options.sensitivity;

        this.euler.x = Math.max(-PI_2, Math.min(PI_2, this.euler.x));

        quaternion.setFromEuler(this.euler);

        this.camera.setQuaternion(quaternion);

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
        const body = this.getCharacter().getBody();
        this.vector.setFromMatrixColumn(body.matrix, 0);
        this.vector.crossVectors(body.up, this.vector);
        body.position.addScaledVector(this.vector, distance);
    };

    moveRight(distance) {
        const body = this.getCharacter().getBody();

        this.vector.setFromMatrixColumn(body.matrix, 0);
        body.position.addScaledVector(this.vector, distance);
    };

    moveUpAndDown(dt) {
        const position = this.getCharacter().getPosition();

        position.y += (this.velocity.y * dt); // new behavior

        if (position.y < this.options.height) {
            this.velocity.y = 0;
            position.y = this.options.height;
            this.canJump = true;
        }

        this.getCharacter().setPosition(position);
    }

    lock() {
        this.domElement.requestPointerLock();
    };

    unlock() {
        document.exitPointerLock();
    };

    updateRaycasters = () => {
        this.raycaster.ray.origin.copy( this.getCharacter().getPosition() );
        this.raycaster.ray.origin.y -= this.options.height;

        this.headRaycaster.ray.origin.copy( this.getCharacter().getPosition() );
        this.headRaycaster.ray.origin.y += this.options.height;
    }

    calculateCollisions = () => ({
        onObject: this.raycaster.intersectObjects(Scene.getChildren(), true).length > 0,
        headCollision: this.headRaycaster.intersectObjects(Scene.getChildren(), true).length > 0
    });

    updateVelocity = (dt) => {
        this.velocity.x -= this.velocity.x * this.options.slowDownFactor * dt;
        this.velocity.z -= this.velocity.z * this.options.slowDownFactor * dt;
        this.velocity.y -= 9.8 * this.options.mass * dt; // 100.0 = mass

        if ( this.movement.forward || this.movement.backwards ) this.velocity.z -= this.direction.z * this.options.speed * dt;
        if ( this.movement.left || this.movement.right ) this.velocity.x -= this.direction.x * this.options.speed * dt;
    }

    updateDirection = () => {
        this.direction.z = Number( this.movement.forward ) - Number( this.movement.backwards );
        this.direction.x = Number( this.movement.right ) - Number( this.movement.left );
        this.direction.normalize(); // this ensures consistent movements in all this.directions
    }

    updateVelocityForCollisions = () => {
        this.updateRaycasters();
        const { onObject, headCollision } = this.calculateCollisions();

        if (onObject) {
            this.velocity.y = Math.max( 0, this.velocity.y );
            this.canJump = true;
        } else if (headCollision && this.velocity.y > 0) {
            this.velocity.y = 0;
        }
    }

    sendBodyUpdate() {
        const element = this.getCharacter();
        if (Physics.hasElement(element)) {
            const { y, w } = this.camera.getQuaternion();
            const cameraDirection = this.camera.getDirection();

            Physics.updateBodyState(element, {
                direction: this.direction,
                movement: this.movement,
                quaternion: { x: 0, y, z: 0, w },
                cameraDirection
            });
        } else {
            debounce(() => {
                console.log(PHYSICS_ELEMENT_MISSING, element);
            }, 3000)
        }
    }

    update(dt) {
        if (this.isLocked) {

            this.updateDirection();
            this.updateVelocity(dt);

            if (!this.hasPhysicsEnabled()) {
                this.updateVelocityForCollisions();

                this.moveRight(- this.velocity.x * dt);
                this.moveForward(- this.velocity.z * dt);
                this.moveUpAndDown(dt);
            } else {
                this.sendBodyUpdate()
            }
        }
    }
}
