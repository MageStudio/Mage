export default class Entity {
	constructor() {}

	start() {}

	update() {}

	render() {
		if (this.mesh && this.mesh.render) {
			this.mesh.render();
		}
	}

	addScript(scriptname, dir) {
		let path = M.game.SCRIPTS_DIR + (dir || "");
		if (path[path.length - 1] != "/") {
			path += "/"; //adding dir separator if we forgot it
		}
		M.game.attachScriptToObject(this, scriptname, path);
	}

	//__loadScript will be automatically called by Game object
	__loadScript(script) {
		for (let method in script) {
			this[method] = script[method];
		}
		try {
			this.start();
		} catch(e) {
			console.log("I told you, man. Check your start method inside your " + script.name + ".js script");
		}
	}

	addSound(name, options) {
		const _autoplay = options.autoplay || false;
		this.isPlayingSound = _autoplay;
		this.sound = new Sound(name, {mesh: this.mesh, autoplay: _autoplay, effect: options.effect });
	}

	addDirectionalSound(name, options) {
		const _autoplay = options.autoplay || false;
		this.isPlayingSound = _autoplay;
		this.sound = new DirectionalSound(name, {mesh: this.mesh, autoplay: _autoplay, effect: options.effect});
	}

	addAmbientSound(name, options) {
		const _autoplay = options.autoplay || false;
		const _loop = options.loop || false;
		this.isPlayingSound = _autoplay;
		this.sound = new AmbientSound(name, {mesh: this.mesh, autoplay: _autoplay, loop: _loop, effect: options.effect});
	}

	addLight( color, intensity, distance ) {

		const position = {
			x: this.mesh.position.x,
			y: this.mesh.position.y,
			z: this.mesh.position.z
		}
		this.light = new PointLight( color, intensity, distance, position );
		this.addMesh( this.light.mesh.mesh );
	}

	playSound() {
		if (this.sound && !this.isPlayingSound) {
			this.sound.start();
			this.isPlayingSound = true;
		}
	}

	stopSound() {
		if (this.sound && this.isPlayingSound ) {
			this.sound.stop();
			this.isPlayingSound = false;
		}
	}

	scale(options) {
		const _x = options.x || 1,
			_y = options.y || 1,
			_z = options.z || 1;

		if (this.mesh) {
			this.mesh.scale.set(_x, _y, _z);
		}
	}

	position(options) {
		const _x = options.x || this.mesh.position.x,
			_y = options.y || this.mesh.position.y,
			_z = options.z || this.mesh.position.z;

		if (this.mesh) {
			this.mesh.position.set(_x, _y, _z);
		}
	}

	rotation(options) {
		const _x = options.x || this.mesh.rotation.x,
			_y = options.y || this.mesh.rotation.y,
			_z = options.z || this.mesh.rotation.z;

		if (this.mesh) {
			this.mesh.rotation.set(_x, _y, _z);
		}
	}

	add(mesh) {
		if (mesh.mesh && this.mesh) {
			this.mesh.add(mesh.mesh);
		}
	}
}
