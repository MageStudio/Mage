import Light from './Light';
import Scene from '../base/Scene';
import { AmbientLight as THREEAmbientLight } from 'three';
import { AMBIENTLIGHT } from './Lights';

export default class LightAmbient extends Light {

    constructor({ color, intensity = 1, position = {}, name }) {
        super({ color, intensity, name });

        this.light = new THREEAmbientLight(color);

        const { x = 0, y = 0, z = 0 } = position;
        this.light.position.set(x, y, z);

        Scene.add(this.light, this);
    }

    addHelper() {
        this.helper = true;
        this.addHolder('ambientlightholder');
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
