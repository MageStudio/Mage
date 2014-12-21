/**************************************************
		MESH CLASS
**************************************************/

Class("Mesh", {

	Mesh : function(geometry, material, options) {
		Entity.call(this);
		this.geometry = geometry;
		this.material = material;
		this.script = {};
		this.hasScript = false;

		this.mesh = new THREE.Mesh(geometry, material);
		//adding to core
		core.add(this);

		if (options) {
			//do something with options
			for (var o in options) {
				this[o] = options[o];
				if (o == "script") {
					this.hasScript = true;
					this.addScript(options[o], options.dir);
				}
			}
		}
	}

})._extends("Entity");