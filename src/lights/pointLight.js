import Light from './light';
import LightEngine from './LightEngine';
import {
    SphereGeometry,
    MeshPhongMaterial,
    PointLight
} from 'three';

export default class PointLight extends Light {

    constructor(color, intensity, distance, position) {

        super(color, intensity, position);

        this.geometry = new SphereGeometry(
            LightEngine.holderRadius,
            LightEngine.holderSegment,
            LightEngine.holderSegment
        );
        this.material = new MeshPhongMaterial({color: this.color});
        this.mesh = new Mesh(this.geometry, this.material);
        this.light = new PointLight(color, intensity, distance);
        this.mesh.mesh.position.set(this.position.x, this.position.y, this.position.z);
        this.light.position = this.mesh.mesh.position;
        this.mesh.mesh.add(this.light);

        SceneManager.add(this.light, this);

    }
}
