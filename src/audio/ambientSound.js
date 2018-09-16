export default class AmbientSound extends Beat {

	constructor(name, options) {
		super(name);
		//use options to choose whether have a loop or not.
		this.sound.source.loop = options.loop || false;

		//creating panner, we need to update on object movements.
		this.sound.panner = M.audioEngine.context.createPanner();
		//disconnecting from main volume, then connecting to panner and main volume again
		this.sound.volume.disconnect();
		this.sound.volume.connect(this.sound.panner);
		this.sound.panner.connect(M.audioEngine.volume);

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
			this.convolverGain = AudioEngine.context.createGain();
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
		const autoplay = options.autoplay || false;
		if (autoplay) {
			this.start();
		}
		//adding this sound to AudioEngine
		M.audioEngine.add(this);
	}

	update(dt) {

		// In the frame handler function, get the object's position.
		this.mesh.updateMatrixWorld();
		const p = new THREE.Vector3();
		p.setFromMatrixPosition(this.mesh.matrixWorld);

		// And copy the position over to the sound of the object.
		this.sound.panner.setPosition(p.x, p.y, p.z);
	}

}
