import { Vector3 } from 'three';
import Sound from './sound';

export default class DirectionalSound extends Sound {

    constructor(name, angles, options) {
        super(name);

        const {
            target
        } = options;

        if (target) {
            this.setTarget(target);
            this.setPannerAngles(angles);
        }
    }

    setPannerAngles(angles) {
        this.pannerNode.coneInnerAngle = angles.innerAngleInDegrees;
        this.pannerNode.coneOuterAngle = angles.outerAngleInDegrees;
        this.pannerNode.coneOuterGain = angles.outerGainFactor;
    }

    setPannerOrientation() {
        if (this.hasPannerNode()) {
            let vec = new Vector3(0,0,1);
            let m = this.target.getBody().matrixWorld;
    
            // Save the translation column and zero it.
            let mx = m.elements[12], my = m.elements[13], mz = m.elements[14];
            m.elements[12] = m.elements[13] = m.elements[14] = 0;
    
            // Multiply the 0,0,1 vector by the world matrix and normalize the result.
            vec.applyProjection(m);
            vec.normalize();
    
            this.pannerNode.setOrientation(vec.x, vec.y, vec.z);
    
            // Restore the translation column.
            m.elements[12] = mx;
            m.elements[13] = my;
            m.elements[14] = mz;
        }
    }

    update(dt) {
        super.update(dt);
        this.setPannerOrientation();
    }

}
