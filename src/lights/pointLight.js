Class("PointLight", {

    PointLight: function(color, intensity, distance, position) {

        Light.call(this, color, intensity, position);

        this.geometry = new THREE.SphereGeometry( M.lightEngine.holderRadius, M.lightEngine.holderSegment, M.lightEngine.holderSegment );
        this.material = new THREE.MeshPhongMaterial({color: this.color});
        this.mesh = new Mesh( this.geometry, this.material );
        this.light = new THREE.PointLight(color, intensity, distance);
        this.mesh.mesh.position.set(this.position.x, this.position.y, this.position.z);
        this.light.position = this.mesh.mesh.position;
        this.mesh.mesh.add(this.light);

    }

})._extends("Light");
