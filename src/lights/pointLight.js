Class("PointLight", {

    PointLight: function(color, intensity, distance, position) {
        Light.call(this, color, intensity, position);

        this.geometry = new THREE.SphereGeometry( Light.holderRadius, Light.holderSegment, Light.holderSegment );
        this.material = new THREE.MeshPhongMaterial({color: this.color});
        this.sphere = new Mesh( this.geometry, this.material );
        this.light = new THREE.PointLight(color, intensity, distance);
        this.sphere.mesh.position.set(this.position.x, this.position.y, this.position.z);
        this.light.position = this.sphere.mesh.position;
        this.sphere.mesh.add(this.light);
    }

})._extends("Light");