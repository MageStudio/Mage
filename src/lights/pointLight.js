import Light from './light';

export default class PointLight extends Light {

    constructor(color, intensity, distance, position) {

        super(color, intensity, position);

        this.geometry = new THREE.SphereGeometry( M.lightEngine.holderRadius, M.lightEngine.holderSegment, M.lightEngine.holderSegment );
        this.material = new THREE.MeshPhongMaterial({color: this.color});
        this.mesh = new Mesh( this.geometry, this.material );
        this.light = new THREE.PointLight(color, intensity, distance);
        this.mesh.mesh.position.set(this.position.x, this.position.y, this.position.z);
        this.light.position = this.mesh.mesh.position;
        this.mesh.mesh.add(this.light);

    }
}
