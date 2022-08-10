import BaseScript from '../BaseScript';
import { Vector3 } from 'three';

const DEFAULT_DISTANCE = 5.0;
const DEFAULT_HEIGHT = 3.0;
const DEFAULT_HEIGHT_DAMPING = 2.0;
const DEFAULT_LOOK_AT_HEIGHT = 1;
const DEFAULT_ROTATION_SNAP_TIME = 0.3;
const DEFAULT_DISTANCE_SNAP_TIME = 0.5;
const DEFAULT_DISTANCE_MULTIPLIER = 1;

export default class SmoothCarFollow extends BaseScript {

    constructor() {
        super('SmoothCarFollow');
    }

    start(camera, options) {
        const {
            target,
            height = DEFAULT_HEIGHT,
            heightDamping = DEFAULT_HEIGHT_DAMPING,
            lookAtHeight = DEFAULT_LOOK_AT_HEIGHT,
            distance = DEFAULT_DISTANCE,
            rotationSnapTime = DEFAULT_ROTATION_SNAP_TIME,
            distanceSnapTime = DEFAULT_DISTANCE_SNAP_TIME,
            distanceMultiplier = DEFAULT_DISTANCE_MULTIPLIER,
            lerpFactor
        } = options;

        this.camera = camera;
        this.target = target;
        
        this.height = height;
        this.heightDamping = heightDamping;
        
        this.distance = distance;
        
        this.rotationSnapTime = rotationSnapTime;
        this.distanceSnapTime = distanceSnapTime;
        
        this.distanceMultiplier = distanceMultiplier;
        this.lerpFactor = lerpFactor;
        
        this.lookAtVector = new Vector3(0, lookAtHeight, 0);
    }

    followCar(dt) {
        const direction = this.target.getPhysicsState('direction');
        if (direction) {
            const { x, y, z } = direction;
            const cameraPosition = this.camera.getPosition();
            const targetPosition = this.target.getPosition();
            const vector = new Vector3(x, y, z)
                .negate()
                .normalize()
                .multiplyScalar(this.distance);

            vector.y = y + this.height;
            const desiredPosition = targetPosition.add(vector);
            const lerpFactor = this.lerpFactor || 1 - Math.pow(0.1, dt);

            cameraPosition.lerpVectors(cameraPosition, desiredPosition, lerpFactor);

            this.camera.setPosition(cameraPosition);

            const lookAtTarget = new Vector3();
            lookAtTarget.copy(this.target.getPosition().add(this.lookAtVector));

            this.camera.lookAt(lookAtTarget);
        }
    }

    update(dt) {
        this.followCar(dt);
    }

}