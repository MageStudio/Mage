Class("Light", {

	Light : function(color) {
		this.mesh = new THREE.AmbientLight(color);
		app.add(this.mesh, this);
	}

})._extends("Entity");
