Class("AmbientLight", {

	AmbientLight : function(color) {
		this.mesh = new THREE.AmbientLight(color);
		core.add(this);
	}

})._extends("Entity");