import { EventDispatcher, Vector3, Euler, Quaternion, MathUtils } from "three";

import Scene from "../core/Scene";
import { debounce } from "../lib/functions";
import { PHYSICS_ELEMENT_MISSING } from "../lib/messages";

import Physics from "../physics";

const CHANGE_EVENT = { type: "change" };
const LOCK_EVENT = { type: "lock" };
const UNLOCK_EVENT = { type: "unlock" };

export default class ThirdPersonControl extends EventDispatcher {
    constructor(camera, domElement, options = {}) {
        super();

        const {
            distance = 5,
            heightOffset = 2,
            sensitivity = 0.002,
            target = null,
            physicsEnabled = false,
            speed = 2,
            jumpSpeed = 2,
            mass = 100,
            height = 1.8,
            slowDownFactor = 20,
            minPolarAngle = 0.1,
            maxPolarAngle = Math.PI / 2 - 0.1,
        } = options;

        this.options = {
            distance,
            heightOffset,
            sensitivity,
            target,
            physicsEnabled,
            speed,
            jumpSpeed,
            mass,
            height,
            slowDownFactor,
            minPolarAngle,
            maxPolarAngle,
        };

        this.camera = camera;
        this.character = target;
        this.domElement = domElement || document.body;
        this.isLocked = false;

        // Spherical angles for camera orbit
        this.theta = 0; // yaw (horizontal rotation around Y)
        this.phi = Math.PI / 4; // pitch (vertical angle from horizon)

        // Movement state
        this.movement = {};
        this.movement.forward = false;
        this.movement.backwards = false;
        this.movement.left = false;
        this.movement.right = false;
        this.canJump = false;

        // For non-physics mode
        this.velocity = new Vector3();
        this.direction = new Vector3();

        // Character facing direction (Y-axis rotation only)
        this.characterQuaternion = new Quaternion();
        this.characterYaw = 0;
        this.hasMovementInput = false;
        this.wantsJump = false;
        this.spaceHeld = false;
    }

    init() {
        this._onClick = this.onClick.bind(this);
        this._onMouseMove = this.onMouseMove.bind(this);
        this._onKeyDown = this.onKeyDown.bind(this);
        this._onKeyUp = this.onKeyUp.bind(this);
        this._onPointerlockChange = this.onPointerlockChange.bind(this);
        this._onPointerlockError = this.onPointerlockError.bind(this);

        document.addEventListener("click", this._onClick, false);
        document.addEventListener("mousemove", this._onMouseMove, false);
        document.addEventListener("keydown", this._onKeyDown, false);
        document.addEventListener("keyup", this._onKeyUp, false);
        document.addEventListener("pointerlockchange", this._onPointerlockChange, false);
        document.addEventListener("pointerlockerror", this._onPointerlockError, false);
    }

    dispose() {
        document.removeEventListener("click", this._onClick, false);
        document.removeEventListener("mousemove", this._onMouseMove, false);
        document.removeEventListener("keydown", this._onKeyDown, false);
        document.removeEventListener("keyup", this._onKeyUp, false);
        document.removeEventListener("pointerlockchange", this._onPointerlockChange, false);
        document.removeEventListener("pointerlockerror", this._onPointerlockError, false);

        this.unlock();
    }

    hasPhysicsEnabled = () => this.options.physicsEnabled;

    getCharacter() {
        return this.character || this.camera;
    }

    // --- Pointer Lock ---

    onClick() {
        if (!this.isLocked) {
            this.lock();
        }
    }

    lock() {
        this.domElement.requestPointerLock();
    }

    unlock() {
        document.exitPointerLock();
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
        console.error("Unable to use Pointer Lock API", e);
    }

    // --- Mouse Look ---

    onMouseMove(event) {
        if (!this.isLocked) return;

        const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        this.theta -= movementX * this.options.sensitivity;
        this.phi += movementY * this.options.sensitivity;

        this.phi = MathUtils.clamp(
            this.phi,
            this.options.minPolarAngle,
            this.options.maxPolarAngle,
        );

        this.dispatchEvent(CHANGE_EVENT);
    }

    // --- Keyboard Input ---

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
                if (!this.spaceHeld && this.canJump) {
                    this.velocity.y += this.options.jumpSpeed;
                    this.wantsJump = true;
                    this.canJump = false;
                }
                this.spaceHeld = true;
                break;
        }
    }

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
            case 32: // space
                this.spaceHeld = false;
                break;
        }
    }

    // --- Camera ---

    /**
     * Returns the camera forward direction projected onto the XZ plane.
     * Used for physics worker communication and camera-relative movement.
     */
    getCameraForwardXZ() {
        return {
            x: Math.sin(this.theta),
            y: 0,
            z: Math.cos(this.theta),
        };
    }

    /**
     * Positions the camera behind/above the target using spherical coordinates.
     */
    updateCameraPosition() {
        const target = this.getCharacter();
        const targetPos = target.getPosition();
        const { distance, heightOffset } = this.options;

        // Camera offset: behind and above the character
        const offsetX = -Math.sin(this.theta) * Math.cos(this.phi) * distance;
        const offsetY = Math.sin(this.phi) * distance + heightOffset;
        const offsetZ = -Math.cos(this.theta) * Math.cos(this.phi) * distance;

        this.camera.setPosition({
            x: targetPos.x + offsetX,
            y: targetPos.y + offsetY,
            z: targetPos.z + offsetZ,
        });

        // Look at the character (slightly above center)
        this.camera.lookAt({
            x: targetPos.x,
            y: targetPos.y + heightOffset * 0.5,
            z: targetPos.z,
        });
    }

    // --- Character Rotation ---

    /**
     * Computes the character's facing direction from WASD input
     * relative to camera yaw, and updates the character quaternion.
     */
    updateCharacterRotation() {
        const isMoving =
            this.movement.forward ||
            this.movement.backwards ||
            this.movement.left ||
            this.movement.right;

        if (!isMoving) {
            this.hasMovementInput = false;
            return;
        }

        this.hasMovementInput = true;

        const cameraForward = this.getCameraForwardXZ();
        let moveX = 0;
        let moveZ = 0;

        if (this.movement.forward) {
            moveX += cameraForward.x;
            moveZ += cameraForward.z;
        }
        if (this.movement.backwards) {
            moveX -= cameraForward.x;
            moveZ -= cameraForward.z;
        }
        if (this.movement.left) {
            moveX += cameraForward.z;
            moveZ -= cameraForward.x;
        }
        if (this.movement.right) {
            moveX -= cameraForward.z;
            moveZ += cameraForward.x;
        }

        this.characterYaw = Math.atan2(moveX, moveZ);
        this.characterQuaternion.setFromEuler(new Euler(0, this.characterYaw, 0, "YXZ"));

        // In non-physics mode, apply rotation directly
        if (!this.hasPhysicsEnabled()) {
            this.getCharacter().setQuaternion(this.characterQuaternion);
        }
    }

    // --- Direction/Velocity (non-physics mode) ---

    updateDirection() {
        this.direction.z = Number(this.movement.forward) - Number(this.movement.backwards);
        this.direction.x = Number(this.movement.right) - Number(this.movement.left);
        this.direction.normalize();
    }

    updateVelocity(dt) {
        this.velocity.x -= this.velocity.x * this.options.slowDownFactor * dt;
        this.velocity.z -= this.velocity.z * this.options.slowDownFactor * dt;

        // Gravity is acceleration (9.8 m/s²), not force — mass is irrelevant here
        this.velocity.y -= 9.8 * dt;

        if (this.movement.forward || this.movement.backwards)
            this.velocity.z -= this.direction.z * this.options.speed * dt;
        if (this.movement.left || this.movement.right)
            this.velocity.x -= this.direction.x * this.options.speed * dt;
    }

    /**
     * Move the character directly using camera-relative directions (non-physics mode).
     */
    moveCharacter(dt) {
        const character = this.getCharacter();
        const pos = character.getPosition();
        const cameraForward = this.getCameraForwardXZ();

        // Forward/back along camera direction
        let dx = cameraForward.x * (-this.velocity.z * dt);
        let dz = cameraForward.z * (-this.velocity.z * dt);

        // Strafe perpendicular to camera direction
        dx += -cameraForward.z * (-this.velocity.x * dt);
        dz += cameraForward.x * (-this.velocity.x * dt);

        pos.x += dx;
        pos.z += dz;

        // Vertical (gravity/jump)
        pos.y += this.velocity.y * dt;
        if (pos.y < this.options.height) {
            this.velocity.y = 0;
            pos.y = this.options.height;
            this.canJump = true;
        }

        character.setPosition(pos);
    }

    // --- Physics Integration ---

    sendBodyUpdate() {
        const element = this.getCharacter();
        if (Physics.hasElement(element)) {
            const cameraDirection = this.getCameraForwardXZ();
            const { y, w } = this.characterQuaternion;

            const state = {
                direction: this.direction,
                movement: this.movement,
                quaternion: { x: 0, y, z: 0, w },
                cameraDirection,
                speed: this.options.speed * 2,
                walkSpeed: this.options.speed,
            };

            // Send jump impulse if requested
            if (this.wantsJump) {
                state.jump = true;
                state.jumpSpeed = this.options.jumpSpeed;
                this.wantsJump = false;
            }

            Physics.updateBodyState(element, state);
        } else {
            debounce(() => {
                console.log(PHYSICS_ELEMENT_MISSING, element);
            }, 3000);
        }
    }

    // Required by Controls.onPhysicsUpdate()
    // Called AFTER handlePhysicsUpdate runs on all elements,
    // so we can safely override the quaternion that physics reset.
    physicsUpdate() {
        if (this.hasPhysicsEnabled() && this.character) {
            // Re-enable jumping when grounded AND space is released
            const grounded = this.character.getPhysicsState("grounded");
            if (grounded && !this.spaceHeld) {
                this.canJump = true;
            }

            // Apply visual rotation after physics has overwritten it.
            // Physics uses angularFactor=0 so the body never rotates;
            // we drive rotation visually from the control input.
            if (this.hasMovementInput) {
                const body = this.character.getBody();
                body.quaternion.set(
                    this.characterQuaternion.x,
                    this.characterQuaternion.y,
                    this.characterQuaternion.z,
                    this.characterQuaternion.w,
                );
                body.updateMatrixWorld(true);
            }
        }
    }

    // --- Main Update Loop ---

    update(dt) {
        if (this.isLocked) {
            this.updateDirection();
            this.updateCharacterRotation();

            if (!this.hasPhysicsEnabled()) {
                this.updateVelocity(dt);
                this.moveCharacter(dt);
            } else {
                this.sendBodyUpdate();
            }
        }

        // Always position camera relative to character
        if (this.character) {
            this.updateCameraPosition();
        }
    }
}
