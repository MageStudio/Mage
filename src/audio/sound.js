import Beat from './Beat';
import Audio from './Audio';
import { Vector3 } from 'three';

export default class Sound extends Beat {

    constructor(name, options = {}) {
        super(name);

        const {
            loop = false,
            effect = false,
            autoplay = false
        } = options;

        this.source.loop = loop;
        this.target = null;
        this.pannerNode = null;
        this.convolverNode = null;

        if (autoplay) {
            this.play();
        }

        Audio.add(this);
    }
    
    createPannerNode() {
        this.pannerNode = Audio.context.createPanner();

        this.volumeNode.disconnect();
        this.volumeNode.connect(this.pannerNode);
        this.pannerNode.connect(Audio.getMasterVolumeNode());
    }

    hasEffect() {
        return !!this.convolverNode;
    }

    addEffect(effect) {
        if (!this.hasEffect() && effect) {
            this.convolverNode = Audio.context.createConvolver();
            this.mixerNode = Audio.createGain();

            if (this.hasPannerNode()) {
                this.pannerNode.disconnect();
                this.pannerNode.connect(this.mixerNode);
            } else {
                this.volumeNode.disconnect();
                this.volumeNode.connect(this.mixerNode);
            }

            //creating gains
            this.plainGainNode = Audio.context.createGain();
            this.convolverGainNode = Audio.context.createGain();

            //connect mixer to new gains
            this.mixerNode.connect(this.plainGainNode);
            this.mixerNode.connect(this.convolverGainNode);

            this.plainGainNode.connect(Audio.getMasterVolumeNode());
            this.convolverGainNode.connect(Audio.getMasterVolumeNode());

            this.convolverNode.buffer = Audio.get(effect);

            this.convolverGainNode.gain.setValueAtTime(0.7, Audio.context.currentTime);
            this.plainGainNode.gain.setValueAtTime(0.3, Audio.context.currentTime);
        }
    }

    hasPannerNode() {
        return !!this.pannerNode;
    }

    hasTarget() {
        return !!this.target;
    }

    getTarget() {
        return this.target;
    }

    setTarget(target) {
        this.target = target;
        this.createPannerNode();
    }

    update(dt) {
        if (this.hasTarget() && this.hasPannerNode()) {
            const p = new Vector3();
            p.setFromMatrixPosition(this.target.getBody().matrixWorld);
            const px = p.x, py = p.y, pz = p.z;

            this.target.getBody().updateMatrixWorld();

            const q = new Vector3();
            q.setFromMatrixPosition(this.target.getBody().matrixWorld);
            const dx = q.x-px, dy = q.y-py, dz = q.z-pz;
            //setting panner position and velocity using doppler effect.
            try {
                this.panner.setPosition(q.x, q.y, q.z);
                this.panner.setVelocity(dx/dt, dy/dt, dz/dt);
            } catch (e) {
                // quick and dirty solution.
            }
        }
    }

}
