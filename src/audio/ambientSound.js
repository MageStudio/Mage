import Audio from './Audio';
import { Vector3 } from 'three';
import Beat from './Beat';

export default class AmbientSound extends Beat {

    constructor(name, options) {
        super(name);
        //use options to choose whether have a loop or not.
        this.source.loop = options.loop || false;

        //creating panner, we need to update on object movements.
        this.panner = Audio.context.createPanner();
        //disconnecting from main volume, then connecting to panner and main volume again
        this.volumeNode.disconnect();
        this.volumeNode.connect(this.panner);
        this.panner.connect(Audio.volume);

        //storing body
        this.body = options.body;

        //if we set up an effect in our options, we need to create a convolver node
        if (options.effect) {

            this.convolver = Audio.context.createConvolver();
            this.mixer = Audio.context.createGain();
            this.panner.disconnect();
            this.panner.connect(this.mixer);
            //creating gains
            this.plainGain = Audio.context.createGain();
            this.convolverGain = Audio.context.createGain();
            //connect mixer to new gains
            this.mixer.connect(plainGain);
            this.mixer.connect(convolverGain);

            this.plainGain.connect(Audio.volume);
            this.convolverGain.connect(Audio.volume);

            this.convolver.buffer = Audio.get(options.effect);
            this.convolverGain.gain.value = 0.7;
            this.plainGain.gain.value = 0.3;

        }
        //autoplay option
        const autoplay = options.autoplay || false;
        if (autoplay) {
            this.play();
        }
        //adding this sound to Audio
        Audio.add(this);
    }

    update(dt) {

        // In the frame handler function, get the object's position.
        this.body.updateMatrixWorld();
        const p = new Vector3();
        p.setFromMatrixPosition(this.body.matrixWorld);

        // And copy the position over to the sound of the object.
        this.panner.setPosition(p.x, p.y, p.z);
    }

}
