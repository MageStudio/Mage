import { EventDispatcher, Vector3, Euler, Quaternion, MathUtils } from "three";

import { debounce } from "../lib/functions";
import { PHYSICS_ELEMENT_MISSING, THIRD_PERSON_CONTROL_TARGET_MISSING } from "../lib/messages";

import Config from "../core/config";
import Physics, { PHYSICS_CONSTANTS } from "../physics";

const { COLLIDER_TYPES } = PHYSICS_CONSTANTS;

const CHANGE_EVENT = { type: "change" };
const LOCK_EVENT = { type: "lock" };
const UNLOCK_EVENT = { type: "unlock" };

export default class ThirdPersonControl extends EventDispatcher {
    constructor(camera, domElement, options = {}) {
        super();

        const {
            distance = 5,
            // cameraHeight: how far above the character the camera sits
            cameraHeight = options.heightOffset ?? 2,
            sensitivity = 0.002,
            target = null,
            physicsEnabled = false,
            speed = 2,
            jumpSpeed = 2,
            mass = 100,
            // groundLevel: the Y coordinate of the floor (non-physics mode only)
            groundLevel = options.height ?? 0.5,
            slowDownFactor = 20,
            minPolarAngle = 0.1,
            maxPolarAngle = Math.PI / 2 - 0.1,
            // originOffset: offset from the model origin to the desired capsule
            // centre.  Adjust this if the character sinks into or floats above
            // the ground.  Positive Y moves the capsule up relative to the model.
            originOffset = { x: 0, y: 0, z: 0 },
        } = options;

        this.options = {
            distance,
            cameraHeight,
            sensitivity,
            target,
            physicsEnabled,
            speed,
            jumpSpeed,
            mass,
            groundLevel,
            slowDownFactor,
            minPolarAngle,
            maxPolarAngle,
            originOffset,
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

        // For non-physics mode (gravity/jump only — horizontal movement is direct)
        this.velocity = new Vector3();

        // Character facing direction (Y-axis rotation only)
        this.characterQuaternion = new Quaternion();
        this.characterYaw = 0;
        this.hasMovementInput = false;
        this.wantsJump = false;
        this.spaceHeld = false;
    }

    init() {
        if (!this.character) {
            console.error(THIRD_PERSON_CONTROL_TARGET_MISSING);
            return;
        }

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

        // In non-physics mode, use the character's starting Y as ground level
        // when no explicit value was provided, so it doesn't free-fall on start.
        if (!this.hasPhysicsEnabled()) {
            const startY = this.character.getPosition().y;
            if (this.options.groundLevel === 0.5 && startY > 1) {
                this.options.groundLevel = startY;
            }
            // Start grounded so the first jump works
            this.canJump = true;
        }

        if (this.hasPhysicsEnabled()) {
            this.addCharacterToPhysics();
        }
    }

    addCharacterToPhysics() {
        if (!Physics.hasElement(this.character)) {
            this.character.enablePhysics({
                colliderType: COLLIDER_TYPES.PLAYER,
                mass: this.options.mass,
                originOffset: this.options.originOffset,
            });
        }
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
        return this.character;
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

            // Clear movement flags so the physics worker stops applying velocity.
            this.movement.forward = false;
            this.movement.backwards = false;
            this.movement.left = false;
            this.movement.right = false;
            this.hasMovementInput = false;
            this.wantsJump = false;

            // Send a final "idle" update to the worker to halt the character.
            if (this.hasPhysicsEnabled()) {
                this.sendBodyUpdate();
            }
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
        const { distance, cameraHeight } = this.options;

        // Camera offset: behind and above the character
        const offsetX = -Math.sin(this.theta) * Math.cos(this.phi) * distance;
        const offsetY = Math.sin(this.phi) * distance + cameraHeight;
        const offsetZ = -Math.cos(this.theta) * Math.cos(this.phi) * distance;

        this.camera.setPosition({
            x: targetPos.x + offsetX,
            y: targetPos.y + offsetY,
            z: targetPos.z + offsetZ,
        });

        // Look at the character (slightly above center)
        this.camera.lookAt({
            x: targetPos.x,
            y: targetPos.y + cameraHeight * 0.5,
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

    // --- Movement (non-physics mode) ---

    /**
     * Move the character using camera-relative directions (non-physics mode).
     * Uses direct velocity (matching the physics mode feel) instead of
     * acceleration, so movement is responsive and predictable.
     */
    moveCharacter(dt) {
        const character = this.getCharacter();
        const pos = character.getPosition();
        const cameraForward = this.getCameraForwardXZ();
        const speed = this.options.speed;

        const isMoving =
            this.movement.forward ||
            this.movement.backwards ||
            this.movement.left ||
            this.movement.right;

        if (isMoving) {
            // Compute camera-relative movement direction (same logic as physics worker)
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

            // Normalize so diagonal movement isn't faster
            const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
            if (len > 0) {
                moveX /= len;
                moveZ /= len;
            }

            pos.x += moveX * speed * dt;
            pos.z += moveZ * speed * dt;
        }

        // Gravity — read from engine config so it matches the physics world
        const gravityY = Math.abs(Config.physics()?.gravity?.y ?? 30);
        this.velocity.y -= gravityY * dt;
        pos.y += this.velocity.y * dt;

        // Ground clamp
        if (pos.y <= this.options.groundLevel) {
            pos.y = this.options.groundLevel;
            this.velocity.y = 0;
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
                movement: this.movement,
                quaternion: { x: 0, y, z: 0, w },
                cameraDirection,
                speed: this.options.speed,
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
        if (this.hasPhysicsEnabled()) {
            // Re-enable jumping when grounded AND space is released
            const grounded = this.character.getPhysicsState("grounded");
            if (grounded && !this.spaceHeld) {
                this.canJump = true;
            }

            // Always override the quaternion from physics — player rotation
            // is purely visual and driven by the control, not by physics.
            // This prevents any physics rotation drift from affecting the visual.
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

    // --- Main Update Loop ---

    update(dt) {
        if (this.isLocked) {
            this.updateCharacterRotation();

            if (!this.hasPhysicsEnabled()) {
                this.moveCharacter(dt);
            } else {
                this.sendBodyUpdate();
            }
        }

        // Always position camera relative to character
        this.updateCameraPosition();
    }
}
