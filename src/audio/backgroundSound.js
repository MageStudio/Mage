import Audio from './Audio';
import Beat from './Beat';

export default class BackgroundSound extends Beat {

    constructor(name, options) {
        super(name);
        //use options to choose whether have a loop or not.
        this.sound.source.loop = options.loop || true;

        //storing mesh
        this.mesh = options.mesh;

        //if we set up an effect in our options, we need to create a convolver node
        if (options.effect) {

            this.convolver = Audio.context.createConvolver();
            this.mixer = Audio.context.createGain();
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

            this.convolver.buffer = Audio.get(options.effect);
            this.convolverGain.gain.value = 0.7;
            this.plainGain.gain.value = 0.3;

        }
        //autoplay option
        const autoplay = options.autoplay || true;
        if (autoplay) {
            this.play();
        }
        //adding this sound to Audio
        Audio.add(this);
    }

    update(dt) {}

}
