Class("Sound", {

	Sound : function(name, opt) {
		Beat.call(this, name);
		var options = opt || {};
		//creating panner, we need to update on object movements.
		this.sound.panner = M.audioEngine.context.createPanner();
		//disconnecting from main volume, then connecting to panner and main volume again
		this.sound.volume.disconnect();
		this.sound.volume.connect(this.sound.panner);
		this.sound.panner.connect(M.audioEngine.volume);

		if (options.mesh) {
			this.mesh = options.mesh;
		} else {
			this.update = function() {};
		}

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
		//setting listeners if provided
		//this.onEndCallback = options.onEnd || new Function();
		//this.onLoopStartCallback = options.onLoopStart || new Function();
		//this.onLoopEndCallback = options.onLoopEnd || new Function();

		//adding this sound to AudioEngine
		M.audioEngine.add(this);
	},

	update : function(dt) {

		if (this.mesh) {
			var p = new THREE.Vector3();
			p.setFromMatrixPosition(this.mesh.matrixWorld);
			var px = p.x, py = p.y, pz = p.z;

			this.mesh.updateMatrixWorld();

			var q = new THREE.Vector3();
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

})._extends("Beat");