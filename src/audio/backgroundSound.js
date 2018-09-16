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

            this.convolver = M.audioEngine.context.createConvolver();
            this.mixer = M.audioEngine.context.createGain();
            this.sound.panner.disconnect();
            this.sound.panner.connect(this.mixer);
            //creating gains
            this.plainGain = M.audioEngine.context.createGain();
            this.convolverGain = M.audioEngine.context.createGain();
            //connect mixer to new gains
            this.mixer.connect(plainGain);
            this.mixer.connect(convolverGain);

            this.plainGain.connect(M.audioEngine.volume);
            this.convolverGain.connect(M.audioEngine.volume);

            this.convolver.buffer = M.audioEngine.get(options.effect);
            this.convolverGain.gain.value = 0.7;
            this.plainGain.gain.value = 0.3;

        }
        //autoplay option
        const autoplay = options.autoplay || true;
        if (autoplay) {
            this.start();
        }
        //adding this sound to AudioEngine
        M.audioEngine.add(this);
    }

    update(dt) {}

}
