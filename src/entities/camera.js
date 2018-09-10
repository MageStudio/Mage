/**************************************************
		Camera CLASS
**************************************************/

Class("Camera", {

	Camera : function(options) {
		Entity.call(this);
		this.options = options;
		this.object = new THREE.PerspectiveCamera(options.fov, options.ratio , options.near, options.far );
		//adding to core
	},

})._extends("Entity");
