import {
    Object3D,
    MeshBasicMaterial,
    LineBasicMaterial,
    BufferGeometry,
    PlaneBufferGeometry,
    SphereBufferGeometry,
    CylinderBufferGeometry,
    BoxBufferGeometry,
    Float32BufferAttribute,
    Mesh,
    OctahedronBufferGeometry,
    TorusBufferGeometry,
    Line,
    Vector3,
    Quaternion,
    Matrix4,
    Euler,
    Color,
    DoubleSide
} from 'three';

export default class Gizmo extends Object3D {

    constructor() {
        super();

        this.type = 'TransformControlsGizmo';

    	// shared materials
    	this.gizmoMaterial = new MeshBasicMaterial({
    		depthTest: false,
    		depthWrite: false,
    		transparent: true,
    		side: DoubleSide,
    		fog: false
    	});

    	this.gizmoLineMaterial = new LineBasicMaterial({
    		depthTest: false,
    		depthWrite: false,
    		transparent: true,
    		linewidth: 1,
    		fog: false
    	});

        this.arrowGeometry = new CylinderBufferGeometry(0, 0.05, 0.2, 12, 1, false);

    	this.scaleHandleGeometry = new BoxBufferGeometry(0.125, 0.125, 0.125);

    	this.lineGeometry = new BufferGeometry();
    	this.lineGeometry.addAttribute('position', new Float32BufferAttribute([0, 0, 0,	1, 0, 0], 3));

    	// Make unique material for each axis/color
    	this.matInvisible = this.gizmoMaterial.clone();
    	this.matInvisible.opacity = 0.15;

    	this.matHelper = this.gizmoMaterial.clone();
    	this.matHelper.opacity = 0.33;

    	this.matRed = this.gizmoMaterial.clone();
    	this.matRed.color.set(0xff0000);

    	this.matGreen = this.gizmoMaterial.clone();
    	this.matGreen.color.set(0x00ff00);

    	this.matBlue = this.gizmoMaterial.clone();
    	this.matBlue.color.set(0x0000ff);

    	this.matWhiteTransperent = this.gizmoMaterial.clone();
    	this.matWhiteTransperent.opacity = 0.25;

    	this.matYellowTransparent = this.matWhiteTransperent.clone();
    	this.matYellowTransparent.color.set(0xffff00);

    	this.matCyanTransparent = this.matWhiteTransperent.clone();
    	this.matCyanTransparent.color.set(0x00ffff);

    	this.matMagentaTransparent = this.matWhiteTransperent.clone();
    	this.matMagentaTransparent.color.set(0xff00ff);

    	this.matYellow = this.gizmoMaterial.clone();
    	this.matYellow.color.set(0xffff00);

    	this.matLineRed = this.gizmoLineMaterial.clone();
    	this.matLineRed.color.set(0xff0000);

    	this.matLineGreen = this.gizmoLineMaterial.clone();
    	this.matLineGreen.color.set(0x00ff00);

    	this.matLineBlue = this.gizmoLineMaterial.clone();
    	this.matLineBlue.color.set(0x0000ff);

    	this.matLineCyan = this.gizmoLineMaterial.clone();
    	this.matLineCyan.color.set(0x00ffff);

    	this.matLineMagenta = this.gizmoLineMaterial.clone();
    	this.matLineMagenta.color.set(0xff00ff);

    	this.matLineYellow = this.gizmoLineMaterial.clone();
    	this.matLineYellow.color.set(0xffff00);

    	this.matLineGray = this.gizmoLineMaterial.clone();
    	this.matLineGray.color.set(0x787878);

    	this.matLineYellowTransparent = this.matLineYellow.clone();
    	this.matLineYellowTransparent.opacity = 0.25;

        this.tempVector = new Vector3(0, 0, 0);
    	this.tempEuler = new Euler();
    	this.alignVector = new Vector3(0, 1, 0);
    	this.zeroVector = new Vector3(0, 0, 0);
    	this.lookAtMatrix = new Matrix4();
    	this.tempQuaternion = new Quaternion();
    	this.tempQuaternion2 = new Quaternion();
    	this.identityQuaternion = new Quaternion();

    	this.unitX = new Vector3(1, 0, 0);
    	this.unitY = new Vector3(0, 1, 0);
    	this.unitZ = new Vector3(0, 0, 1);

    	// Gizmo creation

    	this.gizmo = {};
    	this.picker = {};
    	this.helper = {};

    	this.add(this.gizmo["translate"] = this.setupGizmo(this.getGizmoTranslate()));
    	this.add(this.gizmo["rotate"] = this.setupGizmo(this.getGizmoRotate()));
    	this.add(this.gizmo["scale"] = this.setupGizmo(this.getGizmoScale()));
    	this.add(this.picker["translate"] = this.setupGizmo(this.getPickerTranslate()));
    	this.add(this.picker["rotate"] = this.setupGizmo(this.getPickerRotate()));
    	this.add(this.picker["scale"] = this.setupGizmo(this.getPickerScale()));
    	this.add(this.helper["translate"] = this.setupGizmo(this.getHelperTranslate()));
    	this.add(this.helper["rotate"] = this.setupGizmo(this.getHelperRotate()));
    	this.add(this.helper["scale"] = this.setupGizmo(this.getHelperScale()));

    	// Pickers should be hidden always

    	this.picker["translate"].visible = false;
    	this.picker["rotate"].visible = false;
    	this.picker["scale"].visible = false;

        this.isTransformControlsGizmo = true;
    }

    createCircleGeometry(radius, arc) {
		const geometry = new BufferGeometry();
		const vertices = [];

		for (var i = 0; i <= 64 * arc; ++i) {
			vertices.push(0, Math.cos(i / 32 * Math.PI) * radius, Math.sin(i / 32 * Math.PI) * radius);
		}

		geometry.addAttribute('position', new Float32BufferAttribute(vertices, 3));

		return geometry;
	}

    createTranslateHelperGeometry(radius, arc) {

		const geometry = new BufferGeometry()

		geometry.addAttribute('position', new Float32BufferAttribute([0, 0, 0, 1, 1, 1], 3));

		return geometry;
	}

    getGizmoTranslate() {
        return {
    		X: [
    			[new Mesh(this.arrowGeometry, this.matRed), [1, 0, 0], [0, 0, -Math.PI / 2], null, 'fwd'],
    			[new Mesh(this.arrowGeometry, this.matRed), [1, 0, 0], [0, 0, Math.PI / 2], null, 'bwd'],
    			[new Line(this.lineGeometry, this.matLineRed)]
    		],
    		Y: [
    			[new Mesh(this.arrowGeometry, this.matGreen), [0, 1, 0], null, null, 'fwd'],
    			[new Mesh(this.arrowGeometry, this.matGreen), [0, 1, 0], [Math.PI, 0, 0], null, 'bwd'],
    			[new Line(this.lineGeometry, this.matLineGreen), null, [0, 0, Math.PI / 2]]
    		],
    		Z: [
    			[new Mesh(this.arrowGeometry, this.matBlue), [0, 0, 1], [Math.PI / 2, 0, 0], null, 'fwd'],
    			[new Mesh(this.arrowGeometry, this.matBlue), [0, 0, 1], [-Math.PI / 2, 0, 0], null, 'bwd'],
    			[new Line(this.lineGeometry, this.matLineBlue), null, [0, -Math.PI / 2, 0]]
    		],
    		XYZ: [
    			[new Mesh(new OctahedronBufferGeometry(0.1, 0), this.matWhiteTransperent), [0, 0, 0], [0, 0, 0]]
    		],
    		XY: [
    			[new Mesh(new PlaneBufferGeometry(0.295, 0.295), this.matYellowTransparent), [0.15, 0.15, 0]],
    			[new Line(this.lineGeometry, this.matLineYellow), [0.18, 0.3, 0], null, [0.125, 1, 1]],
    			[new Line(this.lineGeometry, this.matLineYellow), [0.3, 0.18, 0], [0, 0, Math.PI / 2], [0.125, 1, 1]]
    		],
    		YZ: [
    			[new Mesh(new PlaneBufferGeometry(0.295, 0.295), this.matCyanTransparent), [0, 0.15, 0.15], [0, Math.PI / 2, 0]],
    			[new Line(this.lineGeometry, this.matLineCyan), [0, 0.18, 0.3], [0, 0, Math.PI / 2], [0.125, 1, 1]],
    			[new Line(this.lineGeometry, this.matLineCyan), [0, 0.3, 0.18], [0, -Math.PI / 2, 0], [0.125, 1, 1]]
    		],
    		XZ: [
    			[new Mesh(new PlaneBufferGeometry(0.295, 0.295), this.matMagentaTransparent), [0.15, 0, 0.15], [-Math.PI / 2, 0, 0]],
    			[new Line(this.lineGeometry, this.matLineMagenta), [0.18, 0, 0.3], null, [0.125, 1, 1]],
    			[new Line(this.lineGeometry, this.matLineMagenta), [0.3, 0, 0.18], [0, -Math.PI / 2, 0], [0.125, 1, 1]]
    		]
    	}
    }

    getPickerTranslate() {
        return {
    		X: [
    			[new Mesh(new CylinderBufferGeometry(0.2, 0, 1, 4, 1, false), this.matInvisible), [0.6, 0, 0], [0, 0, -Math.PI / 2]]
    		],
    		Y: [
    			[new Mesh(new CylinderBufferGeometry(0.2, 0, 1, 4, 1, false), this.matInvisible), [0, 0.6, 0]]
    		],
    		Z: [
    			[new Mesh(new CylinderBufferGeometry(0.2, 0, 1, 4, 1, false), this.matInvisible), [0, 0, 0.6], [Math.PI / 2, 0, 0]]
    		],
    		XYZ: [
    			[new Mesh(new OctahedronBufferGeometry(0.2, 0), this.matInvisible)]
    		],
    		XY: [
    			[new Mesh(new PlaneBufferGeometry(0.4, 0.4), this.matInvisible), [0.2, 0.2, 0]]
    		],
    		YZ: [
    			[new Mesh(new PlaneBufferGeometry(0.4, 0.4), this.matInvisible), [0, 0.2, 0.2], [0, Math.PI / 2, 0]]
    		],
    		XZ: [
    			[new Mesh(new PlaneBufferGeometry(0.4, 0.4), this.matInvisible), [0.2, 0, 0.2], [-Math.PI / 2, 0, 0]]
    		]
    	};
    }

    getHelperTranslate() {
        return {
    		START: [
    			[new Mesh(new OctahedronBufferGeometry(0.01, 2), this.matHelper), null, null, null, 'helper']
    		],
    		END: [
    			[new Mesh(new OctahedronBufferGeometry(0.01, 2), this.matHelper), null, null, null, 'helper']
    		],
    		DELTA: [
    			[new Line(this.createTranslateHelperGeometry(), this.matHelper), null, null, null, 'helper']
    		],
    		X: [
    			[new Line(this.lineGeometry, this.matHelper.clone()), [-1e3, 0, 0], null, [1e6, 1, 1], 'helper']
    		],
    		Y: [
    			[new Line(this.lineGeometry, this.matHelper.clone()), [0, -1e3, 0], [0, 0, Math.PI / 2], [1e6, 1, 1], 'helper']
    		],
    		Z: [
    			[new Line(this.lineGeometry, this.matHelper.clone()), [0, 0, -1e3], [0, -Math.PI / 2, 0], [1e6, 1, 1], 'helper']
    		]
    	};
    }

    getGizmoRotate() {
        return {
    		X: [
    			[new Line(this.createCircleGeometry(1, 0.5), this.matLineRed)],
    			[new Mesh(new OctahedronBufferGeometry(0.04, 0), this.matRed), [0, 0, 0.99], null, [1, 3, 1]],
    		],
    		Y: [
    			[new Line(this.createCircleGeometry(1, 0.5), this.matLineGreen), null, [0, 0, -Math.PI / 2]],
    			[new Mesh(new OctahedronBufferGeometry(0.04, 0), this.matGreen), [0, 0, 0.99], null, [3, 1, 1]],
    		],
    		Z: [
    			[new Line(this.createCircleGeometry(1, 0.5), this.matLineBlue), null, [0, Math.PI / 2, 0]],
    			[new Mesh(new OctahedronBufferGeometry(0.04, 0), this.matBlue), [0.99, 0, 0], null, [1, 3, 1]],
    		],
    		E: [
    			[new Line(this.createCircleGeometry(1.25, 1), this.matLineYellowTransparent), null, [0, Math.PI / 2, 0]],
    			[new Mesh(new CylinderBufferGeometry(0.03, 0, 0.15, 4, 1, false), this.matLineYellowTransparent), [1.17, 0, 0], [0, 0, -Math.PI / 2], [1, 1, 0.001]],
    			[new Mesh(new CylinderBufferGeometry(0.03, 0, 0.15, 4, 1, false), this.matLineYellowTransparent), [-1.17, 0, 0], [0, 0, Math.PI / 2], [1, 1, 0.001]],
    			[new Mesh(new CylinderBufferGeometry(0.03, 0, 0.15, 4, 1, false), this.matLineYellowTransparent), [0, -1.17, 0], [Math.PI, 0, 0], [1, 1, 0.001]],
    			[new Mesh(new CylinderBufferGeometry(0.03, 0, 0.15, 4, 1, false), this.matLineYellowTransparent), [0, 1.17, 0], [0, 0, 0], [1, 1, 0.001]],
    		],
    		XYZE: [
    			[new Line(this.createCircleGeometry(1, 1), this.matLineGray), null, [0, Math.PI / 2, 0]]
    		]
    	}
    }

    getHelperRotate() {
        return {
    		AXIS: [
    			[new Line(this.lineGeometry, this.matHelper.clone()), [-1e3, 0, 0], null, [1e6, 1, 1], 'helper']
    		]
    	}
    }

    getPickerRotate() {
        return {
    		X: [
    			[new Mesh(new TorusBufferGeometry(1, 0.1, 4, 24), this.matInvisible), [0, 0, 0], [0, -Math.PI / 2, -Math.PI / 2]],
    		],
    		Y: [
    			[new Mesh(new TorusBufferGeometry(1, 0.1, 4, 24), this.matInvisible), [0, 0, 0], [Math.PI / 2, 0, 0]],
    		],
    		Z: [
    			[new Mesh(new TorusBufferGeometry(1, 0.1, 4, 24), this.matInvisible), [0, 0, 0], [0, 0, -Math.PI / 2]],
    		],
    		E: [
    			[new Mesh(new TorusBufferGeometry(1.25, 0.1, 2, 24), this.matInvisible)]
    		],
    		XYZE: [
    			[new Mesh(new SphereBufferGeometry(0.7, 10, 8), this.matInvisible)]
    		]
    	};
    }

    getGizmoScale() {
        return {
    		X: [
    			[new Mesh(this.scaleHandleGeometry, this.matRed), [0.8, 0, 0], [0, 0, -Math.PI / 2]],
    			[new Line(this.lineGeometry, this.matLineRed), null, null, [0.8, 1, 1]]
    		],
    		Y: [
    			[new Mesh(this.scaleHandleGeometry, this.matGreen), [0, 0.8, 0]],
    			[new Line(this.lineGeometry, this.matLineGreen), null, [0, 0, Math.PI / 2], [0.8, 1, 1]]
    		],
    		Z: [
    			[new Mesh(this.scaleHandleGeometry, this.matBlue), [0, 0, 0.8], [Math.PI / 2, 0, 0]],
    			[new Line(this.lineGeometry, this.matLineBlue), null, [0, -Math.PI / 2, 0], [0.8, 1, 1]]
    		],
    		XY: [
    			[new Mesh(this.scaleHandleGeometry, this.matYellowTransparent), [0.85, 0.85, 0], null, [2, 2, 0.2]],
    			[new Line(this.lineGeometry, this.matLineYellow), [0.855, 0.98, 0], null, [0.125, 1, 1]],
    			[new Line(this.lineGeometry, this.matLineYellow), [0.98, 0.855, 0], [0, 0, Math.PI / 2], [0.125, 1, 1]]
    		],
    		YZ: [
    			[new Mesh(this.scaleHandleGeometry, this.matCyanTransparent), [0, 0.85, 0.85], null, [0.2, 2, 2]],
    			[new Line(this.lineGeometry, this.matLineCyan), [0, 0.855, 0.98], [0, 0, Math.PI / 2], [0.125, 1, 1]],
    			[new Line(this.lineGeometry, this.matLineCyan), [0, 0.98, 0.855], [0, -Math.PI / 2, 0], [0.125, 1, 1]]
    		],
    		XZ: [
    			[new Mesh(this.scaleHandleGeometry, this.matMagentaTransparent), [0.85, 0, 0.85], null, [2, 0.2, 2]],
    			[new Line(this.lineGeometry, this.matLineMagenta), [0.855, 0, 0.98], null, [0.125, 1, 1]],
    			[new Line(this.lineGeometry, this.matLineMagenta), [0.98, 0, 0.855], [0, -Math.PI / 2, 0], [0.125, 1, 1]]
    		],
    		XYZX: [
    			[new Mesh(new BoxBufferGeometry(0.125, 0.125, 0.125), this.matWhiteTransperent), [1.1, 0, 0]],
    		],
    		XYZY: [
    			[new Mesh(new BoxBufferGeometry(0.125, 0.125, 0.125), this.matWhiteTransperent), [0, 1.1, 0]],
    		],
    		XYZZ: [
    			[new Mesh(new BoxBufferGeometry(0.125, 0.125, 0.125), this.matWhiteTransperent), [0, 0, 1.1]],
    		]
    	}
    }

    getPickerScale() {
        return {
    		X: [
    			[new Mesh(new CylinderBufferGeometry(0.2, 0, 0.8, 4, 1, false), this.matInvisible), [0.5, 0, 0], [0, 0, -Math.PI / 2]]
    		],
    		Y: [
    			[new Mesh(new CylinderBufferGeometry(0.2, 0, 0.8, 4, 1, false), this.matInvisible), [0, 0.5, 0]]
    		],
    		Z: [
    			[new Mesh(new CylinderBufferGeometry(0.2, 0, 0.8, 4, 1, false), this.matInvisible), [0, 0, 0.5], [Math.PI / 2, 0, 0]]
    		],
    		XY: [
    			[new Mesh(this.scaleHandleGeometry, this.matInvisible), [0.85, 0.85, 0], null, [3, 3, 0.2]],
    		],
    		YZ: [
    			[new Mesh(this.scaleHandleGeometry, this.matInvisible), [0, 0.85, 0.85], null, [0.2, 3, 3]],
    		],
    		XZ: [
    			[new Mesh(this.scaleHandleGeometry, this.matInvisible), [0.85, 0, 0.85], null, [3, 0.2, 3]],
    		],
    		XYZX: [
    			[new Mesh(new BoxBufferGeometry(0.2, 0.2, 0.2), this.matInvisible), [1.1, 0, 0]],
    		],
    		XYZY: [
    			[new Mesh(new BoxBufferGeometry(0.2, 0.2, 0.2), this.matInvisible), [0, 1.1, 0]],
    		],
    		XYZZ: [
    			[new Mesh(new BoxBufferGeometry(0.2, 0.2, 0.2), this.matInvisible), [0, 0, 1.1]],
    		]
    	}
    }

    getHelperScale() {
        return {
    		X: [
    			[new Line(this.lineGeometry, this.matHelper.clone()), [-1e3, 0, 0], null, [1e6, 1, 1], 'helper']
    		],
    		Y: [
    			[new Line(this.lineGeometry, this.matHelper.clone()), [0, -1e3, 0], [0, 0, Math.PI / 2], [1e6, 1, 1], 'helper']
    		],
    		Z: [
    			[new Line(this.lineGeometry, this.matHelper.clone()), [0, 0, -1e3], [0, -Math.PI / 2, 0], [1e6, 1, 1], 'helper']
    		]
    	}
    }

    setupGizmo(gizmoMap) {

		const gizmo = new Object3D();

		for (var name in gizmoMap) {
			for (var i = gizmoMap[name].length; i --;) {
				var object = gizmoMap[name][i][0].clone();
				var position = gizmoMap[name][i][1];
				var rotation = gizmoMap[name][i][2];
				var scale = gizmoMap[name][i][3];
				var tag = gizmoMap[name][i][4];

				// name and tag properties are essential for picking and updating logic.
				object.name = name;
				object.tag = tag;

				if (position) {
					object.position.set(position[0], position[1], position[2]);
				}
				if (rotation) {
					object.rotation.set(rotation[0], rotation[1], rotation[2]);
				}
				if (scale) {
					object.scale.set(scale[0], scale[1], scale[2]);
				}

				object.updateMatrix();

				var tempGeometry = object.geometry.clone();
				tempGeometry.applyMatrix(object.matrix);
				object.geometry = tempGeometry;

				object.position.set(0, 0, 0);
				object.rotation.set(0, 0, 0);
				object.scale.set(1, 1, 1);

				gizmo.add(object);
			}
		}

		return gizmo;

	}

    updateMatrixWorld = () => {

		var space = this.space;

		if (this.mode === 'scale') space = 'local'; // scale always oriented to local rotation

		var quaternion = space === "local" ? this.worldQuaternion : this.identityQuaternion;

		// Show only gizmos for current transform mode

		this.gizmo["translate"].visible = this.mode === "translate";
		this.gizmo["rotate"].visible = this.mode === "rotate";
		this.gizmo["scale"].visible = this.mode === "scale";

		this.helper["translate"].visible = this.mode === "translate";
		this.helper["rotate"].visible = this.mode === "rotate";
		this.helper["scale"].visible = this.mode === "scale";


		var handles = [
            ...this.picker[this.mode].children,
            ...this.gizmo[this.mode].children,
            ...this.helper[this.mode].children
        ];
		//handles = handles.concat(this.picker[this.mode].children);
		//handles = handles.concat(this.gizmo[this.mode].children);
		//handles = handles.concat(this.helper[this.mode].children);
        for (var i = 0; i < handles.length; i++) {

			var handle = handles[i];

			// hide aligned to camera

			handle.visible = true;
			handle.rotation.set(0, 0, 0);
			handle.position.copy(this.worldPosition);

			var eyeDistance = this.worldPosition.distanceTo(this.cameraPosition);
			handle.scale.set(1, 1, 1).multiplyScalar(eyeDistance * this.size / 7);

			// TODO: simplify helpers and consider decoupling from gizmo

			if (handle.tag === 'helper') {

				handle.visible = false;

				if (handle.name === 'AXIS') {

					handle.position.copy(this.worldPositionStart);
					handle.visible = !!this.axis;

					if (this.axis === 'X') {

						this.tempQuaternion.setFromEuler(this.tempEuler.set(0, 0, 0));
						handle.quaternion.copy(quaternion).multiply(this.tempQuaternion);

						if (Math.abs(this.alignVector.copy(this.unitX).applyQuaternion(quaternion).dot(this.eye)) > 0.9) {
							handle.visible = false;
						}
					}
					if (this.axis === 'Y') {
						this.tempQuaternion.setFromEuler(this.tempEuler.set(0, 0, Math.PI / 2));
						handle.quaternion.copy(quaternion).multiply(this.tempQuaternion);

						if (Math.abs(this.alignVector.copy(this.unitY).applyQuaternion(quaternion).dot(this.eye)) > 0.9) {
							handle.visible = false;
						}
					}
					if (this.axis === 'Z') {
						this.tempQuaternion.setFromEuler(this.tempEuler.set(0, Math.PI / 2, 0));
						handle.quaternion.copy(quaternion).multiply(this.tempQuaternion);

						if (Math.abs(this.alignVector.copy(this.unitZ).applyQuaternion(quaternion).dot(this.eye)) > 0.9) {
							handle.visible = false;
						}
					}
					if (this.axis === 'XYZE') {
						this.tempQuaternion.setFromEuler(this.tempEuler.set(0, Math.PI / 2, 0));
						this.alignVector.copy(this.rotationAxis);
						handle.quaternion.setFromRotationMatrix(this.lookAtMatrix.lookAt(this.zeroVector, this.alignVector, this.unitY));
						handle.quaternion.multiply(this.tempQuaternion);
						handle.visible = this.dragging;
					}
					if (this.axis === 'E') {
						handle.visible = false;
					}
				} else if (handle.name === 'START') {

					handle.position.copy(this.worldPositionStart);
					handle.visible = this.dragging;

				} else if (handle.name === 'END') {
					handle.position.copy(this.worldPosition);
					handle.visible = this.dragging;

				} else if (handle.name === 'DELTA') {

					handle.position.copy(this.worldPositionStart);
					handle.quaternion.copy(this.worldQuaternionStart);
					this.tempVector.set(1e-10, 1e-10, 1e-10).add(this.worldPositionStart).sub(this.worldPosition).multiplyScalar(-1);
					this.tempVector.applyQuaternion(this.worldQuaternionStart.clone().inverse());
					handle.scale.copy(this.tempVector);
					handle.visible = this.dragging;

				} else {
					handle.quaternion.copy(quaternion);

					if (this.dragging) {
						handle.position.copy(this.worldPositionStart);
					} else {
						handle.position.copy(this.worldPosition);
					}

					if (this.axis) {
						handle.visible = this.axis.search(handle.name) !== -1;
					}
				}

				// If updating helper, skip rest of the loop
				continue;

			}

			// Align handles to current local or world rotation

			handle.quaternion.copy(quaternion);

			if (this.mode === 'translate' || this.mode === 'scale') {

				// Hide translate and scale axis facing the camera

				var AXIS_HIDE_TRESHOLD = 0.99;
				var PLANE_HIDE_TRESHOLD = 0.2;
				var AXIS_FLIP_TRESHOLD = -0.4;


				if (handle.name === 'X' || handle.name === 'XYZX') {
					if (Math.abs(this.alignVector.copy(this.unitX).applyQuaternion(quaternion).dot(this.eye)) > AXIS_HIDE_TRESHOLD) {
						handle.scale.set(1e-10, 1e-10, 1e-10);
						handle.visible = false;
					}
				}
				if (handle.name === 'Y' || handle.name === 'XYZY') {
					if (Math.abs(this.alignVector.copy(this.unitY).applyQuaternion(quaternion).dot(this.eye)) > AXIS_HIDE_TRESHOLD) {
						handle.scale.set(1e-10, 1e-10, 1e-10);
						handle.visible = false;
					}
				}
				if (handle.name === 'Z' || handle.name === 'XYZZ') {
					if (Math.abs(this.alignVector.copy(this.unitZ).applyQuaternion(quaternion).dot(this.eye)) > AXIS_HIDE_TRESHOLD) {
						handle.scale.set(1e-10, 1e-10, 1e-10);
						handle.visible = false;
					}
				}
				if (handle.name === 'XY') {
					if (Math.abs(this.alignVector.copy(this.unitZ).applyQuaternion(quaternion).dot(this.eye)) < PLANE_HIDE_TRESHOLD) {
						handle.scale.set(1e-10, 1e-10, 1e-10);
						handle.visible = false;
					}
				}
				if (handle.name === 'YZ') {
					if (Math.abs(this.alignVector.copy(this.unitX).applyQuaternion(quaternion).dot(this.eye)) < PLANE_HIDE_TRESHOLD) {
						handle.scale.set(1e-10, 1e-10, 1e-10);
						handle.visible = false;
					}
				}
				if (handle.name === 'XZ') {
					if (Math.abs(this.alignVector.copy(this.unitY).applyQuaternion(quaternion).dot(this.eye)) < PLANE_HIDE_TRESHOLD) {
						handle.scale.set(1e-10, 1e-10, 1e-10);
						handle.visible = false;
					}
				}

				// Flip translate and scale axis ocluded behind another axis

				if (handle.name.search('X') !== -1) {
					if (this.alignVector.copy(this.unitX).applyQuaternion(quaternion).dot(this.eye) < AXIS_FLIP_TRESHOLD) {
						if (handle.tag === 'fwd') {
							handle.visible = false;
						} else {
							handle.scale.x *= -1;
						}
					} else if (handle.tag === 'bwd') {
						handle.visible = false;
					}
				}

				if (handle.name.search('Y') !== -1) {
					if (this.alignVector.copy(this.unitY).applyQuaternion(quaternion).dot(this.eye) < AXIS_FLIP_TRESHOLD) {
						if (handle.tag === 'fwd') {
							handle.visible = false;
						} else {
							handle.scale.y *= -1;
						}
					} else if (handle.tag === 'bwd') {
						handle.visible = false;
					}
				}

				if (handle.name.search('Z') !== -1) {
					if (this.alignVector.copy(this.unitZ).applyQuaternion(quaternion).dot(this.eye) < AXIS_FLIP_TRESHOLD) {
						if (handle.tag === 'fwd') {
							handle.visible = false;
						} else {
							handle.scale.z *= -1;
						}
					} else if (handle.tag === 'bwd') {
						handle.visible = false;
					}
				}

			} else if (this.mode === 'rotate') {

				// Align handles to current local or world rotation

				this.tempQuaternion2.copy(quaternion);
				this.alignVector.copy(this.eye).applyQuaternion(this.tempQuaternion.copy(quaternion).inverse());

				if (handle.name.search("E") !== - 1) {

					handle.quaternion.setFromRotationMatrix(this.lookAtMatrix.lookAt(this.eye, this.zeroVector, this.unitY));

				}

				if (handle.name === 'X') {

					this.tempQuaternion.setFromAxisAngle(this.unitX, Math.atan2(-this.alignVector.y, this.alignVector.z));
					this.tempQuaternion.multiplyQuaternions(this.tempQuaternion2, this.tempQuaternion);
					handle.quaternion.copy(this.tempQuaternion);

				}

				if (handle.name === 'Y') {

					this.tempQuaternion.setFromAxisAngle(this.unitY, Math.atan2(this.alignVector.x, this.alignVector.z));
					this.tempQuaternion.multiplyQuaternions(this.tempQuaternion2, this.tempQuaternion);
					handle.quaternion.copy(this.tempQuaternion);

				}

				if (handle.name === 'Z') {

					this.tempQuaternion.setFromAxisAngle(this.unitZ, Math.atan2(this.alignVector.y, this.alignVector.x));
					this.tempQuaternion.multiplyQuaternions(this.tempQuaternion2, this.tempQuaternion);
					handle.quaternion.copy(this.tempQuaternion);

				}

			}

			// Hide disabled axes
			handle.visible = handle.visible && (handle.name.indexOf("X") === -1 || this.showX);
			handle.visible = handle.visible && (handle.name.indexOf("Y") === -1 || this.showY);
			handle.visible = handle.visible && (handle.name.indexOf("Z") === -1 || this.showZ);
			handle.visible = handle.visible && (handle.name.indexOf("E") === -1 || (this.showX && this.showY && this.showZ));

			// highlight selected axis

			handle.material._opacity = handle.material._opacity || handle.material.opacity;
			handle.material._color = handle.material._color || handle.material.color.clone();

			handle.material.color.copy(handle.material._color);
			handle.material.opacity = handle.material._opacity;

			if (!this.enabled) {
				handle.material.opacity *= 0.5;
				handle.material.color.lerp(new Color(1, 1, 1), 0.5);

			} else if (this.axis) {

				if (handle.name === this.axis) {

					handle.material.opacity = 1.0;
					handle.material.color.lerp(new Color(1, 1, 1), 0.5);

				} else if (this.axis.split('').some(function(a) { return handle.name === a; })) {

					handle.material.opacity = 1.0;
					handle.material.color.lerp(new Color(1, 1, 1), 0.5);

				} else {

					handle.material.opacity *= 0.25;
					handle.material.color.lerp(new Color(1, 1, 1), 0.5);

				}

			}

		}
        super.updateMatrixWorld();
	}
}
