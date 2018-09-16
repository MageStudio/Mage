export default class DirectionalSound extends Beat {

	constructor(name, angles, options) {
		super(name);

		//creating panner, we need to update on object movements.
		this.sound.panner = M.audioEngine.context.createPanner();
		//disconnecting from main volume, then connecting to panner and main volume again
		this.sound.volume.disconnect();
		this.sound.volume.connect(this.sound.panner);
		this.sound.panner.connect(M.audioEngine.volume);

		//storing mesh
		this.mesh = options.mesh;
		//storing direction
		this.sound.panner.coneInnerAngle = angles.innerAngleInDegrees;
		this.sound.panner.coneOuterAngle = angles.outerAngleInDegrees;
		this.sound.panner.coneOuterGain = angles.outerGainFactor;

		if (options.effect) {

			this.convolver = M.audioEngine.context.createConvolver();
			this.mixer = M.audioEngine.createGain();
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
		var autoplay = options.autoplay || false;
		if (autoplay) {
			this.start();
		}
		//adding this sound to AudioEngine
		M.audioEngine.add(this);
	}

	update(dt) {

		var p = new THREE.Vector3();
		p.setFromMatrixPosition(this.mesh.matrixWorld);
		var px = p.x, py = p.y, pz = p.z;

		this.mesh.updateMatrixWorld();

		var q = new THREE.Vector3();
		q.setFromMatrixPosition(this.mesh.matrixWorld);
		var dx = q.x-px, dy = q.y-py, dz = q.z-pz;
		//setting panner position and velocity using doppler effect.
		this.sound.panner.setPosition(q.x, q.y, q.z);
		this.sound.panner.setVelocity(dx/dt, dy/dt, dz/dt);


		var vec = new THREE.Vector3(0,0,1);
		var m = this.mesh.matrixWorld;

		// Save the translation column and zero it.
		var mx = m.elements[12], my = m.elements[13], mz = m.elements[14];
		m.elements[12] = m.elements[13] = m.elements[14] = 0;

		// Multiply the 0,0,1 vector by the world matrix and normalize the result.
		vec.applyProjection(m);
		vec.normalize();

		this.sound.panner.setOrientation(vec.x, vec.y, vec.z);

		// Restore the translation column.
		m.elements[12] = mx;
		m.elements[13] = my;
		m.elements[14] = mz;

	}

}
