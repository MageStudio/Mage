import Beat from './Beat';
import Audio from './Audio';
import { Vector3 } from 'three';

export default class Sound extends Beat {

    constructor(name, options = {}) {
        super(name);

        const {
            body = null,
            loop = false,
            effect = false,
            autoplay = false
        } = options;

        this.sound.source.loop = loop;

        //creating panner, we need to update on object movements.
        this.sound.panner = Audio.context.createPanner();
        //disconnecting from main volume, then connecting to panner and main volume again
        this.sound.volume.disconnect();
        this.sound.volume.connect(this.sound.panner);
        this.sound.panner.connect(Audio.volume);

        this.body = body;

        if (effect) {
            this.convolver = Audio.context.createConvolver();
            this.mixer = Audio.createGain();
            this.sound.panner.disconnect();
            this.sound.panner.connect(this.mixer);
            //creating gains
            this.plainGain = Audio.context.createGain();
            this.convolverGain = Audio.context.createGain();
            //connect mixer to new gains
            this.mixer.connect(plainGain);
            this.mixer.connect(convolverGain);

            this.plainGain.connect(Audio.volume);
            this.convolverGain.connect(Audio.volume);

            this.convolver.buffer = Audio.get(effect);
            this.convolverGain.gain.value = 0.7;
            this.plainGain.gain.value = 0.3;

        }

        if (autoplay) {
            this.play();
        }

        Audio.add(this);
    }

    update(dt) {

        if (this.body) {
            var p = new Vector3();
            p.setFromMatrixPosition(this.body.matrixWorld);
            var px = p.x, py = p.y, pz = p.z;

            this.body.updateMatrixWorld();

            var q = new Vector3();
            q.setFromMatrixPosition(this.body.matrixWorld);
            var dx = q.x-px, dy = q.y-py, dz = q.z-pz;
            //setting panner position and velocity using doppler effect.
            try {
                this.sound.panner.setPosition(q.x, q.y, q.z);
                this.sound.panner.setVelocity(dx/dt, dy/dt, dz/dt);
            } catch (e) {
                // quick and dirty solution.
            }
        }
    }

}
