import Light from './Light';
import SceneManager from '../base/SceneManager';
import {
    AmbientLight,
    Vector3
} from 'three';

export default class AmbientLight extends Light {

    constructor(color, _intensity, _position) {
        var intensity = _intensity ? _intensity : 1,
            position = _position ? _position : new Vector3(0, 0, 0);
        super(color, intensity, position);
        this.light = new AmbientLight(color);
        
        SceneManager.add(this.light, this);
    }

}
