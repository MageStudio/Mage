import {
    PlaneBufferGeometry,
    MeshBasicMaterial,
    Vector3,
    Matrix4,
    Quaternion,
    Mesh,
    DoubleSide
} from 'three';

export default class TransformControlsPlane extends Mesh {
    constructor() {
        super(
    		new PlaneBufferGeometry( 100000, 100000, 2, 2 ),
    		new MeshBasicMaterial( { visible: false, wireframe: true, side: DoubleSide, transparent: true, opacity: 0.1 } )
    	);

    	this.type = 'TransformControlsPlane';

    	this.unitX = new Vector3(1, 0, 0);
    	this.unitY = new Vector3(0, 1, 0);
    	this.unitZ = new Vector3(0, 0, 1);

    	this.tempVector = new Vector3();
    	this.dirVector = new Vector3();
    	this.alignVector = new Vector3();
    	this.tempMatrix = new Matrix4();
    	this.identityQuaternion = new Quaternion();

        this.isTransformControlsPlane = true;

    }

    updateMatrixWorld() {
		var space = this.space;

		this.position.copy(this.worldPosition);

		if (this.mode === 'scale') space = 'local'; // scale always oriented to local rotation

		this.unitX.set(1, 0, 0).applyQuaternion(space === "local" ? this.worldQuaternion : this.identityQuaternion);
		this.unitY.set(0, 1, 0).applyQuaternion(space === "local" ? this.worldQuaternion : this.identityQuaternion);
		this.unitZ.set(0, 0, 1).applyQuaternion(space === "local" ? this.worldQuaternion : this.identityQuaternion);

		// Align the plane for current transform mode, axis and space.
		this.alignVector.copy(this.unitY);

		switch (this.mode) {
			case 'translate':
			case 'scale':
				switch (this.axis) {
					case 'X':
						this.alignVector.copy(this.eye).cross(this.unitX);
						this.dirVector.copy(this.unitX).cross(this.alignVector);
						break;
					case 'Y':
						this.alignVector.copy(this.eye).cross(this.unitY);
						this.dirVector.copy(this.unitY).cross(this.alignVector);
						break;
					case 'Z':
						this.alignVector.copy(this.eye).cross(this.unitZ);
						this.dirVector.copy(this.unitZ).cross(this.alignVector);
						break;
					case 'XY':
						this.dirVector.copy(this.unitZ);
						break;
					case 'YZ':
						this.dirVector.copy(this.unitX);
						break;
					case 'XZ':
						this.alignVector.copy(this.unitZ);
						this.dirVector.copy(this.unitY);
						break;
					case 'XYZ':
					case 'E':
						this.dirVector.set(0, 0, 0);
						break;
				}
				break;
			case 'rotate':
			default:
				// special case for rotate
				this.dirVector.set(0, 0, 0);
		}

		if (this.dirVector.length() === 0) {
			// If in rotate mode, make the plane parallel to camera
			this.quaternion.copy(this.cameraQuaternion);

		} else {
			this.tempMatrix.lookAt(this.tempVector.set(0, 0, 0), this.dirVector, this.alignVector);
			this.quaternion.setFromRotationMatrix(this.stempMatrix);
		}
		super.updateMatrixWorld();
	}
}
