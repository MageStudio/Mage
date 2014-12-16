Game.script("cameraScript", {

	start : function() {

	},

	update : function() {
		this.object.position.x += ( mouseX/2 - this.object.position.x ) * 0.01;
		this.object.position.y += ( - mouseY - this.object.position.y ) * 0.05;
		//blocking camera 
		if (this.object.position.z < CAMERA_MIN_Z) {
			this.object.position.z = CAMERA_MIN_Z;
		}
		if (this.object.position.z > CAMERA_MAX_Z) {
			this.object.position.z = CAMERA_MAX_Z;
		}
		this.object.lookAt( core.scene.position );
	}

});