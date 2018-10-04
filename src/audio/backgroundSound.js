import AudioEngine from './AudioEngine';
import Beat from './Beat';

export default class BackgroundSound extends Beat {

    constructor(name, options) {
        super(name);
        //use options to choose whether have a loop or not.
        this.sound.source.loop = options.loop || true;

        //no need to create panner, nor to disconnect volume.

        //storing mesh
        this.mesh = options.mesh;

        //if we set up an effect in our options, we need to create a convolver node
        if (options.effect) {

            this.convolver = AudioManager.context.createConvolver();
            this.mixer = AudioManager.context.createGain();
            this.sound.panner.disconnect();
            this.sound.panner.connect(this.mixer);
            //creating gains
            this.plainGain = AudioManager.context.createGain();
            this.convolverGain = AudioManager.context.createGain();
            //connect mixer to new gains
            this.mixer.connect(plainGain);
            this.mixer.connect(convolverGain);

            this.plainGain.connect(AudioManager.volume);
            this.convolverGain.connect(AudioManager.volume);

            this.convolver.buffer = AudioManager.get(options.effect);
            this.convolverGain.gain.value = 0.7;
            this.plainGain.gain.value = 0.3;

        }
        //autoplay option
        const autoplay = options.autoplay || true;
        if (autoplay) {
            this.start();
        }
        //adding this sound to AudioEngine
        AudioManager.add(this);
    }

    update(dt) {}

}
