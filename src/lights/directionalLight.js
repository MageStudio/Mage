import Light from './Light';
import {
    DirectionalLight as THREEDirectionalLight
} from 'three';
import SceneManager from '../base/SceneManager';

export default class DirectionalLight extends Light {

    constructor(color, intensity, distance, target) {

        super(color, intensity);

        // @TODO we need to restore mesh, since it's used by entity when adding new lights

        //this.geometry = new THREE.SphereGeometry( LightEngine.holderRadius, LightEngine.holderSegment, LightEngine.holderSegment );
        //this.material = new THREE.MeshPhongMaterial({color: this.color});
        //this.mesh = new Mesh( this.geometry, this.material );
        this.light = new THREEDirectionalLight(color, intensity);

        //this.mesh.mesh.position.set(this.position.x, this.position.y, this.position.z);

        if (target) {
            this.light.target.position.copy(target.position);
        }

        // this.light.position.set(position.x, position.y, position.z);

        this.light.castShadow = true;

		this.light.shadow.mapSize.width = 2048;
		this.light.shadow.mapSize.height = 2048;

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
