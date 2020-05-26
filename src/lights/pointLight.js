import Light from './Light';
import Scene from '../core/Scene';
import { POINTLIGHT } from './Lights';

import {
    PointLight as THREEPointLight
} from 'three';

export default class PointLight extends Light {

    constructor({ color, intensity, distance, position = {}, name }) {
        super({ color, intensity, name });

        this.distance = distance;
        this.light = new THREEPointLight(color, intensity, distance);

        const { x = 0, y = 0, z = 0 } = position;
        this.light.position.set(x, y, z);

        Scene.add(this.light, this);
    }

    addHelper() {
        this.helper = true;
        this.addHolder();
    }

    toJSON() {
        return {
            ...super.toJSON(),
            distance: this.distance,
            type: POINTLIGHT
        }
    }
}
