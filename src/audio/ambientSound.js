import AudioEngine from './AudioEngine';
import { Vector3 } from 'three';
import Beat from './Beat';

export default class AmbientSound extends Beat {

	constructor(name, options) {
		super(name);
		//use options to choose whether have a loop or not.
		this.sound.source.loop = options.loop || false;

		//creating panner, we need to update on object movements.
		this.sound.panner = AudioEngine.context.createPanner();
		//disconnecting from main volume, then connecting to panner and main volume again
		this.sound.volume.disconnect();
		this.sound.volume.connect(this.sound.panner);
		this.sound.panner.connect(AudioEngine.volume);

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
		const autoplay = options.autoplay || false;
		if (autoplay) {
			this.start();
		}
		//adding this sound to AudioEngine
		AudioEngine.add(this);
	}

	update(dt) {

		// In the frame handler function, get the object's position.
		this.mesh.updateMatrixWorld();
		const p = new Vector3();
		p.setFromMatrixPosition(this.mesh.matrixWorld);

		// And copy the position over to the sound of the object.
		this.sound.panner.setPosition(p.x, p.y, p.z);
	}

}
