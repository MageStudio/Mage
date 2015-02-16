Class("BackgroundSound", {
    
    BackgroundSound : function(name, options) {
        Beat.call(this, name);
        //use options to choose whether have a loop or not.
        this.sound.source.loop = options.loop || true;
        
        //no need to create panner, nor to disconnect volume.

        //storing mesh
        this.mesh = options.mesh;

        //if we set up an effect in our options, we need to create a convolver node
        if (options.effect) {

            this.convolver = AudioEngine.context.createConvolver();
            this.mixer = AudioEngine.context.createGain();
            this.sound.panner.disconnect();
            this.sound.panner.connect(this.mixer);
            //creating gains
            this.plainGain = AudioEngine.context.createGain();
            this.convolverGain = AudioEngine.context.createGain();
            //connect mixer to new gains
            this.mixer.connect(plainGain);
            this.mixer.connect(convolverGain);

            this.plainGain.connect(AudioEngine.volume);
            this.convolverGain.connect(AudioEngine.volume);

            this.convolver.buffer = AudioEngine.get(options.effect);
            this.convolverGain.gain.value = 0.7;
            this.plainGain.gain.value = 0.3;

        }
        //autoplay option
        var autoplay = options.autoplay || true;
        if (autoplay) {
            this.start();
        }
        //adding this sound to AudioEngine
        AudioEngine.add(this);
    },

    update : function(dt) {}

})._extends("Beat");