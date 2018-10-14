import Light from './Light';
import SceneManager from '../base/SceneManager';
import {
    AmbientLight as THREEAmbientLight,
    Vector3
} from 'three';

export default class LightAmbient extends Light {

    constructor(color, intensity = 1) {
        super(color, intensity);
        this.light = new THREEAmbientLight(color);

        SceneManager.add(this.light, this);
    }

}
