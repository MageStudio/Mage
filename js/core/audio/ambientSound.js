Class("ambientSound", {
	
	ambientSound : function(name, options) {
		Beat.call(this, name);
		//use options to choose whether have a loop or not.
		this.sound.source.loop = options.loop || false;

		//storing mesh
		this.mesh = options.mesh;
	},

	update : function(dt) {

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
	}

})._extends("Beat");