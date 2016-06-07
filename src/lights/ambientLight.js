Class("AmbientLight", {

    AmbientLight : function(color, _intensity, _position) {
        var intensity = _intensity ? _intensity : 1,
            position = _position ? _position : new THREE.Vector3(0, 0, 0);
        Light.call(this, color, intensity, position);
        this.light = new THREE.AmbientLight(color);
        app.add(this.light, this);
    }

})._extends("Light");
