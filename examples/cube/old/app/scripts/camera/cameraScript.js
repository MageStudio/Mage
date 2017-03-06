Game.script("cameraScript", {

	start : function() {

	},

	update : function() {
		this.object.position.x += ( app.mouseX/2 - this.object.position.x ) * 0.01;
		this.object.position.y += ( - app.mouseY - this.object.position.y ) * 0.05;
		//blocking camera 
		if (this.object.position.z < app.AMERA_MIN_Z) {
			this.object.position.z = app.CAMERA_MIN_Z;
		}
		if (this.object.position.z > app.CAMERA_MAX_Z) {
			this.object.position.z = app.CAMERA_MAX_Z;
		}
		this.object.lookAt( app.scene.position );
	}

});