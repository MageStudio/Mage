import Light from './Light';
import { AmbientLight as THREEAmbientLight } from 'three';
import { AMBIENTLIGHT } from './Lights';

const DEFAULT_POSITION = { x: 0, y: 0, z: 0 };
const DEFAULT_INTENSITY = 0.5;
const WHITE = 0xffffff;

export default class LightAmbient extends Light {

    constructor(options) {
        const {
            color = WHITE,
            intensity = DEFAULT_INTENSITY,
            name
        } = options;
        super({ color, intensity, name });

        this.options = options;
        this.setLight({ color, intensity });
    }

    setLight({
        light,
        color = WHITE,
        intensity = DEFAULT_INTENSITY
    }) {
        if (light) {
            this.light = light;
        } else {
            this.light = new THREEAmbientLight(color, intensity);
        }

        if (this.hasBody()) {
            this.postLightCreation();
        }
    }

    postLightCreation() {
        const {
            position = DEFAULT_POSITION
        } = this.options;

        this.setPosition(position);
        this.addToScene();
    }

    addHelper() {
        this.helper = true;
        this.addHolder('ambientlightholder');
    }

    update(dt) {
        super.update(dt);
        if (this.hasHelper()) {
            this.setPosition(this.holder.getPosition(), { updateHolder: false });
        }
    }

    toJSON() {
        return {
            ...super.toJSON(),
            type: AMBIENTLIGHT
        }
    }
}
