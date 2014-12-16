//this will store a script named "spaceman", which will be attached to the script object of the mesh.
Game.script("spaceman", {

	start : function() {
		this.a = "ciao ";
		var b = "culo";
		this.nome = this.a + b;
	},

	update : function() {
		this.mesh.rotation.x += 0.1;
	}

});