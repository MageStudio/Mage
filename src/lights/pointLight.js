import Light from './Light';
import SceneManager from '../base/SceneManager';

import {
    PointLight as THREEPointLight
} from 'three';

export default class PointLight extends Light {

    constructor({ color, intensity, distance, name }) {
        super({ color, intensity, name });
        this.light = new THREEPointLight(color, intensity, distance);

        SceneManager.add(this.light, this);
    }

    addHelper() {
        this.helper = true;
        this.addHolder();
    }
}
