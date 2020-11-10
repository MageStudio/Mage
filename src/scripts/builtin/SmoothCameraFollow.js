import BaseScript from '../BaseScript';

export default class SmoothCameraFollow extends BaseScript {

    constructor() {
        super('SmoothCameraFollow');
    }

    start(camera, options) {
        const {
            target,
            distance = 20.0,
            height = 5.0,
            lookAtHeight = 1.0,
            heightDamping = 2.0,
            rotationSnapTime = 0.3,
            distanceSnapTime = 0.1
        } = options;

        this.height = height;
        this.distance = distance;
        this.heightDamping = heightDamping;
        this.rotationSnapTime = rotationSnapTime;
        this.distanceSnapTime = distanceSnapTime;

        this.camera = camera;
        this.target = target;

        this.yVelocity = 0.0;
        this.zVelocity = 0.0;
        this.usedDistance = 0.0;

        this.lookAtVector = { x: 0, y: lookAtHeight, z: 0 };
    }

    physicsUpdate(dt) {
        
        const wantedHeight = this.target.getPosition().y + this.height;
        let currentHeight = this.camera.getPosition().y;

        const wantedRotationAngle = this.target.getRotation().y;
        const currentRotationAngle = this.camera.getRotation().y;

        const currentRotationAngle = Mathf.SmoothDampAngle(currentRotationAngle, wantedRotationAngle, this.yVelocity, this.rotationSnapTime);

        currentHeight = Mathf.Lerp(currentHeight, wantedHeight, this.heightDamping * dt);
 
        const wantedPosition = this.target.getPosition();
        wantedPosition.y = currentHeight;


        this.usedDistance = Mathf.SmoothDampAngle(this.usedDistance, this.distance, this.zVelocity, this.distanceSnapTime); 

        wantedPosition += Quaternion.Euler(0, currentRotationAngle, 0) * new Vector3(0, 0, -usedDistance);

        this.camera.setPosition(wantedPosition);
        this.camera.lookAt(target.position + lookAtVector);
    }

}