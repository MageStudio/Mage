/**
 * @author arodic / https://github.com/arodic
 */

import {
    Object3D,
    Mesh,
    Raycaster,
    Quaternion,
    Vector3,
    Vector2,
    PerspectiveCamera,
    OrthographicCamera
} from 'three';

import SceneManager from '../base/SceneManager';

import Gizmo from './TransformGizmo';
import Plane from './TransformPlane';

export default class TransformControls extends Object3D {

    constructor(camera, domElement) {
        super();

        this.domElement = (domElement !== undefined) ? domElement : document;

    	this.visible = false;

    	this.gizmo = new Gizmo();
    	this.plane = new Plane();

        this.add(this.gizmo);
    	this.add(this.plane);

        this.changeEvent = { type: "change" };
    	this.mouseDownEvent = { type: "mouseDown" };
    	this.mouseUpEvent = { type: "mouseUp", mode: this.mode };
    	this.objectChangeEvent = { type: "objectChange" };

        this._camera = camera;
        this._object = undefined;
        this._enabled = true;

        this._axis = null;
        this.setAndDispatch('axis', null);

        this._mode = 'translate';
        this.setAndDispatch('mode', 'translate');

        this._translationSnap = null;
        this._rotationSnap = null;

        this._space = 'world';
        this.setAndDispatch('space', 'world');

        this._size = 1;
        this.setAndDispatch('size', 1);

        this._dragging = false;
        this.setAndDispatch('dragging', false);

        this._showX = true;
        this._showY = true;
        this._showZ = true;
        this.setAndDispatch('showX', true);
        this.setAndDispatch('showY', true);
        this.setAndDispatch('showZ', true);

        this.ray = new Raycaster();

    	this._tempVector = new Vector3();
    	this._tempVector2 = new Vector3();
    	this._tempQuaternion = new Quaternion();
    	this._unit = {
    		X: new Vector3( 1, 0, 0 ),
    		Y: new Vector3( 0, 1, 0 ),
    		Z: new Vector3( 0, 0, 1 )
    	};
    	this._identityQuaternion = new Quaternion();
    	this._alignVector = new Vector3();

    	this._pointStart = new Vector3();
    	this._pointEnd = new Vector3();
    	this._rotationAxis = new Vector3();
        this.setAndDispatch('rotationAxis', new Vector3());

    	this._rotationAngle = 0;

    	this._cameraPosition = new Vector3();
        this.setAndDispatch('cameraPosition', new Vector3());

    	this._cameraQuaternion = new Quaternion();
        this.setAndDispatch('cameraQuaternion', new Quaternion());

    	this.cameraScale = new Vector3();

    	this.parentPosition = new Vector3();
    	this._parentQuaternion = new Quaternion();
    	this.parentScale = new Vector3();

    	this._worldPositionStart = new Vector3();
        this.setAndDispatch('worldPositionStart', new Vector3());

    	this._worldQuaternionStart = new Quaternion();
        this.setAndDispatch('worldQuaternionStart', new Quaternion());

    	this.worldScaleStart = new Vector3();

    	this._worldPosition = new Vector3();
        this.setAndDispatch('worldPosition', new Vector3());

    	this._worldQuaternion = new Quaternion();
        this.setAndDispatch('worldQuaternion', new Quaternion());

    	this.worldScale = new Vector3();

    	this._eye = new Vector3();
        this.setAndDispatch('eye', new Vector3());

    	this._positionStart = new Vector3();
    	this._quaternionStart = new Quaternion();
    	this._scaleStart = new Vector3();


        this.isTransformControls = true;
        SceneManager.add(this, this, false);
    }

    render() {}
    update() {}

    setAndDispatch(fieldName, value) {
        this[`_${fieldName}`] = value;
        this.gizmo[fieldName] = value;
        this.plane[fieldName] = value;

        this.dispatchEvent({ type: fieldName + "-changed", value } );
        this.dispatchEvent(this.changeEvent);
    }

    getPrivateField(fieldName) {
        return this[`_${fieldName}`];
    }

    set camera(value) { this.setAndDispatch('camera', value); }
    get camera() { return this.getPrivateField('camera'); }

    set object(value) { this.setAndDispatch('object', value); } // no
    get object() { return this.getPrivateField('object'); }

    enabled(value) { this.setAndDispatch('enabled', value); }
    get enabled() { return this.getPrivateField('enabled'); }

    set axis(value) { this.setAndDispatch('axis', value); } // si
    get axis() { return this.getPrivateField('axis'); }

    set mode(value) { this.setAndDispatch('mode', value); } // si
    get mode() { return this.getPrivateField('mode'); }

    set translationSnap(value) { this.setAndDispatch('translationSnap', value); } // no
    get translationSnap() { return this.getPrivateField('translationSnap'); }

    set rotationSnap(value) { this.setAndDispatch('rotationSnap', value); } // no
    get rotationSnap() { return this.getPrivateField('rotationSnap'); }

    set space(value) { this.setAndDispatch('space', value); } // si
    get space() { return this.getPrivateField('space'); }

    set size(value) { this.setAndDispatch('size', value); } // si
    get size() { return this.getPrivateField('size'); }

    set dragging(value) { this.setAndDispatch('dragging', value); } // si
    get dragging() { return this.getPrivateField('dragging'); }

    set showX(value) { this.setAndDispatch('showX', value); } // si
    get showX() { return this.getPrivateField('showX'); }

    set showY(value) { this.setAndDispatch('showY', value); } // si
    get showY() { return this.getPrivateField('showY'); }

    set showZ(value) { this.setAndDispatch('showZ', value); } // si
    get showZ() { return this.getPrivateField('showZ'); }

    set parentQuaternion(value) { this.setAndDispatch('parentQuaternion', value); } // no
    get parentQuaternion() { return this.getPrivateField('parentQuaternion'); }

    set worldPosition(value) { this.setAndDispatch('worldPosition', value); } // si
    get worldPosition() { return this.getPrivateField('worldPosition'); }

    set worldPositionStart(value) { this.setAndDispatch('worldPositionStart', value); } // si
    get worldPositionStart() { return this.getPrivateField('worldPositionStart'); }

    set worldQuaternion(value) { this.setAndDispatch('worldQuaternion', value); } // si
    get worldQuaternion() { return this.getPrivateField('worldQuaternion'); }

    set worldQuaternionStart(value) { this.setAndDispatch('worldQuaternionStart', value); } // si
    get worldQuaternionStart() { return this.getPrivateField('worldQuaternionStart'); }

    set cameraPosition(value) { this.setAndDispatch('cameraPosition', value); } // si
    get cameraPosition() { return this.getPrivateField('cameraPosition'); }

    set cameraQuaternion(value) { this.setAndDispatch('cameraQuaternion', value); } // si
    get cameraQuaternion() { return this.getPrivateField('cameraQuaternion'); }

    set pointStart(value) { this.setAndDispatch('pointStart', value); } // no
    get pointStart() { return this.getPrivateField('pointStart'); }

    set pointEnd(value) { this.setAndDispatch('pointEnd', value); } // no
    get pointEnd() { return this.getPrivateField('pointEnd'); }

    set rotationAxis(value) { this.setAndDispatch('rotationAxis', value); } // no
    get rotationAxis() { return this.getPrivateField('rotationAxis'); }

    set rotationAngle(value) { this.setAndDispatch('rotationAngle', value); } // no
    get rotationAngle() { return this.getPrivateField('rotationAngle'); }

    set eye(value) { this.setAndDispatch('eye', value); } // si
    get eye() { return this.getPrivateField('eye'); }


    init() {
        this.domElement.addEventListener("mousedown", this.onPointerDown, false);
		this.domElement.addEventListener("touchstart", this.onPointerDown, false);
		this.domElement.addEventListener("mousemove", this.onPointerHover, false);
		this.domElement.addEventListener("touchmove", this.onPointerHover, false);
		this.domElement.addEventListener("touchmove", this.onPointerMove, false);
		document.addEventListener("mouseup", this.onPointerUp, false);
		this.domElement.addEventListener("touchend", this.onPointerUp, false);
		this.domElement.addEventListener("touchcancel", this.onPointerUp, false);
		this.domElement.addEventListener("touchleave", this.onPointerUp, false);
		this.domElement.addEventListener("contextmenu", this.onContext, false);
    }

    dispose() {
		this.domElement.removeEventListener("mousedown", this.onPointerDown);
		this.domElement.removeEventListener("touchstart", this.onPointerDown);
		this.domElement.removeEventListener("mousemove", this.onPointerHover);
		this.domElement.removeEventListener("touchmove", this.onPointerHover);
		this.domElement.removeEventListener("touchmove", this.onPointerMove);
		document.removeEventListener("mouseup", this.onPointerUp);
		this.domElement.removeEventListener("touchend", this.onPointerUp);
		this.domElement.removeEventListener("touchcancel", this.onPointerUp);
		this.domElement.removeEventListener("touchleave", this.onPointerUp);
		this.domElement.removeEventListener("contextmenu", this.onContext);
	}

    attach({ mesh }) {
        if (!mesh) return;

		this.object = mesh;
		this.visible = true;
	}

    detach() {
		this.object = undefined;
		this.visible = false;
		this.axis = null;
	}

    updateMatrixWorld() {
		if (this.object !== undefined) {
			this.object.updateMatrixWorld();
			this.object.parent.matrixWorld.decompose(this.parentPosition, this.parentQuaternion, this.parentScale);
			this.object.matrixWorld.decompose(this.worldPosition, this.worldQuaternion, this.worldScale);
		}

		this.camera.updateMatrixWorld();
		this.camera.matrixWorld.decompose(this.cameraPosition, this.cameraQuaternion, this.cameraScale);

		if (this.camera instanceof PerspectiveCamera) {
			this.eye.copy(this.cameraPosition).sub(this.worldPosition).normalize();
		} else if (this.camera instanceof OrthographicCamera) {
			this.eye.copy(this.cameraPosition).normalize();
		}

		super.updateMatrixWorld();
	}

    pointerHover = (pointer) => {
		if (this.object === undefined ||
            this.dragging === true ||
            (pointer.button !== undefined && pointer.button !== 0)) return;

		this.ray.setFromCamera(pointer, this.camera);

		var intersect = this.ray.intersectObjects(this.gizmo.picker[this.mode].children, true)[0] || false;

		if (intersect) {
            console.log('intersetcint');
			this.axis = intersect.object.name;
		} else {
			this.axis = null;
		}
	}

    pointerDown = (pointer) => {
		if (this.object === undefined ||
            this.dragging === true ||
            (pointer.button !== undefined && pointer.button !== 0)) return;

		if ((pointer.button === 0 || pointer.button === undefined) && this.axis !== null) {

			this.ray.setFromCamera(pointer, this.camera);

			var planeIntersect = this.ray.intersectObjects([this.plane], true)[0] || false;

			if (planeIntersect) {
				var space = this.space;

				if (this.mode === 'scale') {
					space = 'local';
				} else if (this.axis === 'E' ||  this.axis === 'XYZE' ||  this.axis === 'XYZ') {
					space = 'world';
				}

				if (space === 'local' && this.mode === 'rotate') {
					var snap = this.rotationSnap;

					if (this.axis === 'X' && snap) this.object.rotation.x = Math.round(this.object.rotation.x / snap) * snap;
					if (this.axis === 'Y' && snap) this.object.rotation.y = Math.round(this.object.rotation.y / snap) * snap;
					if (this.axis === 'Z' && snap) this.object.rotation.z = Math.round(this.object.rotation.z / snap) * snap;
				}

				this.object.updateMatrixWorld();
				this.object.parent.updateMatrixWorld();

				this._positionStart.copy(this.object.position);
				this._quaternionStart.copy(this.object.quaternion);
				this._scaleStart.copy(this.object.scale);

				this.object.matrixWorld.decompose(this.worldPositionStart, this.worldQuaternionStart, this.worldScaleStart);

				this.pointStart.copy(planeIntersect.point).sub(this.worldPositionStart);

				if (space === 'local') {
                    this.pointStart.applyQuaternion(this.worldQuaternionStart.clone().inverse());
                }

			}

			this.dragging = true;
			this.mouseDownEvent.mode = this.mode;
			this.dispatchEvent(this.mouseDownEvent);
		}
	}

    pointerMove = (pointer) => {
		var axis = this.axis;
		var mode = this.mode;
		var object = this.object;
		var space = this.space;

		if (mode === 'scale') {
			space = 'local';
		} else if (axis === 'E' ||  axis === 'XYZE' ||  axis === 'XYZ') {
			space = 'world';
		}

		if (object === undefined        ||
            axis === null               ||
            this.dragging === false     ||
            (pointer.button !== undefined && pointer.button !== 0)) return;

		this.ray.setFromCamera(pointer, this.camera);

		var planeIntersect = this.ray.intersectObjects([this.plane], true)[ 0 ] || false;

		if (planeIntersect === false) return;

		this.pointEnd.copy(planeIntersect.point).sub(this.worldPositionStart);

		if (space === 'local') this.pointEnd.applyQuaternion(this.worldQuaternionStart.clone().inverse());

		if (mode === 'translate') {

			if (axis.search('X') === -1) {
				this.pointEnd.x = this.pointStart.x;
			}
			if (axis.search('Y') === -1) {
				this.pointEnd.y = this.pointStart.y;
			}
			if (axis.search('Z') === -1) {
				this.pointEnd.z = this.pointStart.z;
			}

			// Apply translate

			if (space === 'local') {
				object.position.copy(this.pointEnd).sub(this.pointStart).applyQuaternion(this._quaternionStart);
			} else {
				object.position.copy(this.pointEnd).sub(this.pointStart);
			}

			object.position.add(this._positionStart);

			// Apply translation snap

			if (this.translationSnap) {

				if (space === 'local') {
					object.position.applyQuaternion(this._tempQuaternion.copy(this._quaternionStart).inverse());

					if (axis.search('X') !== -1) {
						object.position.x = Math.round(object.position.x / this.translationSnap) * this.translationSnap;
					}

					if (axis.search('Y') !== -1) {
						object.position.y = Math.round(object.position.y / this.translationSnap) * this.translationSnap;
					}

					if (axis.search('Z') !== -1) {
						object.position.z = Math.round(object.position.z / this.translationSnap) * this.translationSnap;
					}

					object.position.applyQuaternion(this._quaternionStart);
				}

				if (space === 'world') {

					if (object.parent) {
						object.position.add(this._tempVector.setFromMatrixPosition(object.parent.matrixWorld));
					}

					if (axis.search('X') !== -1) {
						object.position.x = Math.round(object.position.x / this.translationSnap) * this.translationSnap;
					}

					if (axis.search('Y') !== -1) {
						object.position.y = Math.round(object.position.y / this.translationSnap) * this.translationSnap;
					}

					if (axis.search('Z') !== -1) {
						object.position.z = Math.round(object.position.z / this.translationSnap) * this.translationSnap;
					}

					if (object.parent) {
						object.position.sub(this._tempVector.setFromMatrixPosition(object.parent.matrixWorld));
					}
				}
			}
		} else if (mode === 'scale') {

			if (axis.search('XYZ') !== -1) {
				var d = this.pointEnd.length() / this.pointStart.length();
				if (this.pointEnd.dot(this.pointStart) < 0) d *= -1;

				this._tempVector.set(d, d, d);
			} else {
				this._tempVector.copy(this.pointEnd).divide(this.pointStart);

				if (axis.search('X') === -1) {
					this._tempVector.x = 1;
				}
				if (axis.search('Y') === -1) {
					this._tempVector.y = 1;
				}
				if (axis.search('Z') === -1) {
					this._tempVector.z = 1;
				}
			}
			// Apply scale
			object.scale.copy(this._scaleStart).multiply(this._tempVector);

		} else if (mode === 'rotate') {
			const ROTATION_SPEED = 20 / this.worldPosition.distanceTo(this._tempVector.setFromMatrixPosition(this.camera.matrixWorld));

			var quaternion = this.space === "local" ? this.worldQuaternion : this._identityQuaternion;

			var unit = _unit[axis];

			if (axis === 'E') {
				this._tempVector.copy(this.pointEnd).cross(this.pointStart);
				this.rotationAxis.copy(this.eye);
				this.rotationAngle = this.pointEnd.angleTo(this.pointStart) * (this._tempVector.dot(this.eye) < 0 ? 1 : -1);
			} else if (axis === 'XYZE') {
				this._tempVector.copy(this.pointEnd).sub(this.pointStart).cross(this.eye).normalize();
				this.rotationAxis.copy(this._tempVector);
				this.rotationAngle = this.pointEnd.sub(this.pointStart).dot(this._tempVector.cross(this.eye)) * ROTATION_SPEED;
			} else if (axis === 'X' || axis === 'Y' || axis === 'Z') {
				this._alignVector.copy(unit).applyQuaternion(quaternion);
				this.rotationAxis.copy(unit);
				this._tempVector = unit.clone();
				this._tempVector2 = this.pointEnd.clone().sub(this.pointStart);

				if (space === 'local') {
					this._tempVector.applyQuaternion(quaternion);
					this._tempVector2.applyQuaternion(this.worldQuaternionStart);
				}
				this.rotationAngle = this._tempVector2.dot(this._tempVector.cross(this.eye).normalize()) * ROTATION_SPEED;
			}

			// Apply rotation snap
			if (this.rotationSnap) this.rotationAngle = Math.round(this.rotationAngle / this.rotationSnap) * this.rotationSnap;

			// Apply rotate
			if (space === 'local') {
				object.quaternion.copy(this._quaternionStart);
				object.quaternion.multiply(this._tempQuaternion.setFromAxisAngle(this.rotationAxis, this.rotationAngle));
			} else {
				object.quaternion.copy(this._tempQuaternion.setFromAxisAngle(this.rotationAxis, this.rotationAngle));
				object.quaternion.multiply(this._quaternionStart);
			}
		}

		this.dispatchEvent(this.changeEvent);
		this.dispatchEvent(this.objectChangeEvent);
	}

    pointerMove = (pointer) => {
		var axis = this.axis;
		var mode = this.mode;
		var object = this.object;
		var space = this.space;

		if (mode === 'scale') {
			space = 'local';
		} else if (axis === 'E' ||  axis === 'XYZE' ||  axis === 'XYZ') {
			space = 'world';
		}

		if (object === undefined    ||
            axis === null           ||
            this.dragging === false ||
            (pointer.button !== undefined && pointer.button !== 0)) return;

		this.ray.setFromCamera(pointer, this.camera);

		var planeIntersect = this.ray.intersectObjects([this.plane], true)[ 0 ] || false;

		if (planeIntersect === false) return;

		this.pointEnd.copy(planeIntersect.point).sub(this.worldPositionStart);

		if (space === 'local') this.pointEnd.applyQuaternion(this.worldQuaternionStart.clone().inverse());

		if (mode === 'translate') {

			if (axis.search('X') === -1) {
				this.pointEnd.x = this.pointStart.x;
			}
			if (axis.search('Y') === -1) {
				this.pointEnd.y = this.pointStart.y;
			}
			if (axis.search('Z') === -1) {
				this.pointEnd.z = this.pointStart.z;
			}

			// Apply translate

			if (space === 'local') {
				object.position.copy(this.pointEnd).sub(this.pointStart).applyQuaternion(this._quaternionStart);
			} else {
				object.position.copy(this.pointEnd).sub(this.pointStart);
			}

			object.position.add(this._positionStart);

			// Apply translation snap

			if (this.translationSnap) {

				if (space === 'local') {

					object.position.applyQuaternion(this._tempQuaternion.copy(this._quaternionStart).inverse());

					if (axis.search('X') !== -1) {
						object.position.x = Math.round(object.position.x / this.translationSnap) * this.translationSnap;
					}

					if (axis.search('Y') !== -1) {
						object.position.y = Math.round(object.position.y / this.translationSnap) * this.translationSnap;
					}

					if (axis.search('Z') !== -1) {
						object.position.z = Math.round(object.position.z / this.translationSnap) * this.translationSnap;
					}

					object.position.applyQuaternion(this._quaternionStart);

				}

				if (space === 'world') {

					if (object.parent) {
						object.position.add(this._tempVector.setFromMatrixPosition(object.parent.matrixWorld));
					}

					if (axis.search('X') !== -1) {
						object.position.x = Math.round(object.position.x / this.translationSnap) * this.translationSnap;
					}

					if (axis.search('Y') !== -1) {
						object.position.y = Math.round(object.position.y / this.translationSnap) * this.translationSnap;
					}

					if (axis.search('Z') !== -1) {
						object.position.z = Math.round(object.position.z / this.translationSnap) * this.translationSnap;
					}

					if (object.parent) {
						object.position.sub(this._tempVector.setFromMatrixPosition(object.parent.matrixWorld));
					}

				}

			}

		} else if (mode === 'scale') {

			if (axis.search('XYZ') !== -1) {

				var d = this.pointEnd.length() / this.pointStart.length();

				if (this.pointEnd.dot(this.pointStart) < 0) d *= -1;

				this._tempVector.set(d, d, d);

			} else {

				this._tempVector.copy(this.pointEnd).divide(this.pointStart);

				if (axis.search('X') === -1) {
					this._tempVector.x = 1;
				}
				if (axis.search('Y') === -1) {
					this._tempVector.y = 1;
				}
				if (axis.search('Z') === -1) {
					this._tempVector.z = 1;
				}

			}

			// Apply scale

			object.scale.copy(this._scaleStart).multiply(this._tempVector);

		} else if (mode === 'rotate') {

			var ROTATION_SPEED = 20 / this.worldPosition.distanceTo(this._tempVector.setFromMatrixPosition(this.camera.matrixWorld));

			var quaternion = this.space === "local" ? this.worldQuaternion : this._identityQuaternion;

			var unit = this._unit[ axis ];

			if (axis === 'E') {

				this._tempVector.copy(this.pointEnd).cross(this.pointStart);
				this.rotationAxis.copy(this.eye);
				this.rotationAngle = this.pointEnd.angleTo(this.pointStart) * (this._tempVector.dot(this.eye) < 0 ? 1 : -1);

			} else if (axis === 'XYZE') {

				this._tempVector.copy(this.pointEnd).sub(this.pointStart).cross(this.eye).normalize();
				this.rotationAxis.copy(this._tempVector);
				this.rotationAngle = this.pointEnd.sub(this.pointStart).dot(this._tempVector.cross(this.eye)) * ROTATION_SPEED;

			} else if (axis === 'X' || axis === 'Y' || axis === 'Z') {

				this._alignVector.copy(unit).applyQuaternion(quaternion);

				this.rotationAxis.copy(unit);

				this._tempVector = unit.clone();
				this._tempVector2 = this.pointEnd.clone().sub(this.pointStart);
				if (space === 'local') {
					this._tempVector.applyQuaternion(quaternion);
					this._tempVector2.applyQuaternion(this.worldQuaternionStart);
				}
				this.rotationAngle = this._tempVector2.dot(this._tempVector.cross(this.eye).normalize()) * ROTATION_SPEED;

			}
			// Apply this.rotation snap
			if (this.rotationSnap) this.rotationAngle = Math.round(this.rotationAngle / this.this.rotationSnap) * this.this.rotationSnap;
			// Apply rotate
			if (space === 'local') {
				object.quaternion.copy(this._quaternionStart);
				object.quaternion.multiply(this._tempQuaternion.setFromAxisAngle(this.rotationAxis, this.rotationAngle));

			} else {
				object.quaternion.copy(this._tempQuaternion.setFromAxisAngle(this.rotationAxis, this.rotationAngle));
				object.quaternion.multiply(this._quaternionStart);

			}
		}
		this.dispatchEvent(this.changeEvent);
		this.dispatchEvent(this.objectChangeEvent);
	}

    pointerUp = (pointer) => {

		if (pointer.button !== undefined && pointer.button !== 0) return;

		if (this.dragging && (this.axis !== null)) {
			this.mouseUpEvent.mode = this.mode;
			this.dispatchEvent(this.mouseUpEvent);
		}

		this.dragging = false;

		if (pointer.button === undefined) this.axis = null;
	}

    getPointer = (event) => {
		const pointer = event.changedTouches ? event.changedTouches[ 0 ] : event;
		const rect = this.domElement.getBoundingClientRect();

		return {
			x: ( pointer.clientX - rect.left ) / rect.width * 2 - 1,
			y: - ( pointer.clientY - rect.top ) / rect.height * 2 + 1,
			button: event.button
		};
	}

    onContext = (event) => {
		event.preventDefault();
	}

    onPointerHover = (event) => {
		if (!this.enabled) return;

		this.pointerHover(this.getPointer(event));
	}

    onPointerDown = (event) => {
		if (!this.enabled) return;

		event.preventDefault();

		document.addEventListener("mousemove", this.onPointerMove, false);

		this.pointerHover(this.getPointer(event));
		this.pointerDown(this.getPointer(event));
	}

    onPointerMove = (event) => {
		if (!this.enabled) return;

		event.preventDefault();

		this.pointerMove(this.getPointer(event));
	}

    onPointerUp = (event) => {

		if (!this.enabled) return;

		event.preventDefault(); // Prevent MouseEvent on mobile

		document.removeEventListener("mousemove", this.onPointerMove, false);

		this.pointerUp(this.getPointer(event));
	}

    getMode() {
		return this.mode;
	}

	setMode(mode) {
		this.mode = mode;
	}

	setTranslationSnap(translationSnap) {
		this.translationSnap = translationSnap;
	}

	setRotationSnap(rotationSnap) {
		this.rotationSnap = rotationSnap;
	}

	setSize(size) {
		this.size = size;
	}

	setSpace(space) {
		this.space = space;
	}
}
