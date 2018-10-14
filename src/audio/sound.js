import Beat from './Beat';
import AudioEngine from './AudioEngine';
import { Vector3 } from 'three';

export default class Sound extends Beat {

	constructor(name, opt) {
		super(name);

		var options = opt || {};
		//creating panner, we need to update on object movements.
		this.sound.panner = AudioEngine.context.createPanner();
		//disconnecting from main volume, then connecting to panner and main volume again
		this.sound.volume.disconnect();
		this.sound.volume.connect(this.sound.panner);
		this.sound.panner.connect(AudioEngine.volume);

		if (options.mesh) {
			this.mesh = options.mesh;
		} else {
			this.update = function() {};
		}

		if (options.effect) {

			this.convolver = AudioEngine.context.createConvolver();
			this.mixer = AudioEngine.createGain();
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
		var autoplay = options.autoplay || false;
		if (autoplay) {
			this.start();
		}
		//setting listeners if provided
		//this.onEndCallback = options.onEnd || new Function();
		//this.onLoopStartCallback = options.onLoopStart || new Function();
		//this.onLoopEndCallback = options.onLoopEnd || new Function();

		//adding this sound to AudioEngine
		AudioEngine.add(this);
	}

	update(dt) {

		if (this.mesh) {
			var p = new Vector3();
			p.setFromMatrixPosition(this.mesh.matrixWorld);
			var px = p.x, py = p.y, pz = p.z;

			this.mesh.updateMatrixWorld();

			var q = new Vector3();
			q.setFromMatrixPosition(this.mesh.matrixWorld);
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
