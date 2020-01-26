import Light from './Light';
import SceneManager from '../base/SceneManager';
import { AmbientLight as THREEAmbientLight } from 'three';
import { AMBIENTLIGHT } from './lightEngine';
import AmbientLampModel from './ambient_lamp.json';

export default class LightAmbient extends Light {

    constructor({ color, intensity = 1, position = {}, name }) {
        super({ color, intensity, name });

        this.light = new THREEAmbientLight(color);

        const { x = 0, y = 0, z = 0 } = position;
        this.light.position.set(x, y, z);

        SceneManager.add(this.light, this);
    }

    addHelper() {
        this.helper = true;
        this.addHolder(AmbientLampModel);
    }

    update(dt) {
        super.update(dt);
        if (this.hasHelper()) {
            this.position(this.holder.position())
        }
    }

    toJSON() {
        return {
            ...super.toJSON(),
            type: AMBIENTLIGHT
        }
    }
}
