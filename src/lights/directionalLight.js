import Light from './Light';
import {
    DirectionalLight
} from 'three';
import SceneManager from '../base/SceneManager';

export default class DirectionalLight extends Light {

    constructor(color, intensity, distance, position, target) {

        super(color, intensity, position);

        //this.geometry = new THREE.SphereGeometry( LightEngine.holderRadius, LightEngine.holderSegment, LightEngine.holderSegment );
        //this.material = new THREE.MeshPhongMaterial({color: this.color});
        //this.mesh = new Mesh( this.geometry, this.material );
        this.light = new DirectionalLight(color, intensity);

        //this.mesh.mesh.position.set(this.position.x, this.position.y, this.position.z);

        if (target) {
            this.light.target.position.copy(target.position);
        }

        this.light.position.set(position.x, position.y, position.z);

        this.light.castShadow = true;

		this.light.shadow.mapSize.width = 512;
		this.light.shadow.mapSize.height = 512;

		var d = 300;

		this.light.shadow.camera.left = -d;
		this.light.shadow.camera.right = d;
		this.light.shadow.camera.top = d;
		this.light.shadow.camera.bottom = -d;

		this.light.shadow.camera.far = 1000;
        //this.mesh.mesh.add(this.light);
        SceneManager.add(this.light, this);

    }

}
