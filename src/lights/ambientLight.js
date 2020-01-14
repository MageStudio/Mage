import Light from './Light';
import SceneManager from '../base/SceneManager';
import {
    AmbientLight as THREEAmbientLight,
    MeshBasicMaterial,
    SphereGeometry
} from 'three';
import Mesh from '../entities/mesh';
import AmbientLampModel from './ambient_lamp.json';

export default class LightAmbient extends Light {

    constructor({ color, intensity = 1, name }) {
        super({ color, intensity, name });

        this.light = new THREEAmbientLight(color);

        SceneManager.add(this.light, this);
    }

    addHelper() {
        this.helper = true;
        this.addHolder(AmbientLampModel);
    }

    update(dt) {
        super.update(dt);
        //  setting position if the light is using a helper.
        if (this.hasHelper()) {
            this.position(this.holder.position())
        }
    }
}
