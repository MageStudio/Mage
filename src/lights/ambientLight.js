import Light from './Light';
import SceneManager from '../base/SceneManager';
import {
    AmbientLight as THREEAmbientLight,
    MeshBasicMaterial,
    SphereGeometry
} from 'three';
import Mesh from '../entities/mesh';

export default class LightAmbient extends Light {

    constructor({ color, intensity = 1, name }) {
        super({ color, intensity, name });

        this.light = new THREEAmbientLight(color);

        SceneManager.add(this.light, this);
    }

    addHelper() {
        // this helper
        // setting holder to be some default mesh
        this.helper = true;
        const segments = 8;
        const radius = 5;
        const geometry = new SphereGeometry(radius, segments, segments);
        const material = new MeshBasicMaterial({
            color: 0xffff00,
            wireframe: true,
        });

        this.holder = new Mesh(geometry, material);
    }

    update(dt) {
        super.update(dt);
        //  setting position if the light is using a helper.
        if (this.hasHelper()) {
            this.position(this.holder.position())
        }
    }
}
