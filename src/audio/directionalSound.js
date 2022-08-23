import { Vector3 } from "three";
import Scene from "../core/Scene";
import { ENTITY_TYPES } from "../entities/constants";
import { generateRandomName } from "../lib/uuid";
import Audio from "./Audio";
import Sound from "./Sound";

export default class DirectionalSound extends Sound {

    constructor(source, { name = generateRandomName('DirectionalSound'), ...options}) {
        super({ source, name, ...options });

        this.setEntityType(ENTITY_TYPES.AUDIO.DIRECTIONAL);
        this.createPannerNode(options);
        this.connect();
    }

    hasPannerNode() {
        return !!this.pannerNode;
    }

    createPannerNode(options = {}) {
        const {
            coneInnerAngleDegrees = 360,
            coneOuterAngleDegrees = 0,
            coneOuterGain = 0,
            maxDistance = 10000,
            rolloffFactor = 1,
            refDistance = 1
        } = options;

        this.pannerNode = Audio.context.createPanner();

        this.pannerNode.panningModel = 'HRTF';
        this.pannerNode.distanceModel = 'inverse';
        this.pannerNode.refDistance = refDistance;
        this.pannerNode.maxDistance = maxDistance;
        this.pannerNode.rolloffFactor = rolloffFactor;
        this.pannerNode.coneInnerAngle = coneInnerAngleDegrees;
        this.pannerNode.coneOuterAngle = coneOuterAngleDegrees;
        this.pannerNode.coneOuterGain = coneOuterGain;
    }

    connect() {
        if (this.connected) {
            this.disconnect();
        }

        this.volumeNode.connect(Audio.getMasterVolumeNode());
        this.pannerNode.connect(this.volumeNode);
        this.audioNode.connect(this.pannerNode);
        this.connected = true;

        this.tryAutoplay();
    }

    disconnect() {
        if (this.connected) {
            this.volumeNode.disconnect();
            this.pannerNode.disconnect();
            this.audioNode.disconnect();
            this.connected = false;
        }
    }

    updatePannerOrientation() {
        let vec = new Vector3(0,0,1);
        let m = this.getBody().matrixWorld;

        // Save the translation column and zero it.
        let mx = m.elements[12], my = m.elements[13], mz = m.elements[14];
        m.elements[12] = m.elements[13] = m.elements[14] = 0;

        // Multiply the 0,0,1 vector by the world matrix and normalize the result.
        vec.applyMatrix4(m);
        vec.normalize();

        this.pannerNode.orientationX.setValueAtTime(vec.x, Audio.context.currentTime);
        this.pannerNode.orientationY.setValueAtTime(vec.y, Audio.context.currentTime);
        this.pannerNode.orientationZ.setValueAtTime(vec.z, Audio.context.currentTime);

        // Restore the translation column.
        m.elements[12] = mx;
        m.elements[13] = my;
        m.elements[14] = mz;
    }

    updatePannerPosition() {
        this.getBody().updateMatrixWorld();
        const position = new Vector3();

        position.setFromMatrixPosition(this.getBody().matrixWorld);

        this.pannerNode.positionX.setValueAtTime(position.x, Audio.context.currentTime);
        this.pannerNode.positionY.setValueAtTime(position.y, Audio.context.currentTime);
        this.pannerNode.positionZ.setValueAtTime(position.z, Audio.context.currentTime);

    }

    update(dt) {
        super.update(dt);
        if (this.hasPannerNode()) {
            this.updatePannerOrientation();
            this.updatePannerPosition();
        }
    }
}