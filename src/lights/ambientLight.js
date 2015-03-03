Class("AmbientLight", {

    AmbientLight : function(color, intensity, position) {
        Light.call(this, color, intensity, position);
        this.mesh = new THREE.AmbientLight(color);
        app.add(this.mesh, this);
    }

})._extends("Light");
