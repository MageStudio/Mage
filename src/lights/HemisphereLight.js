import Light from './Light';
import Scene from '../core/Scene';
import {
    HemisphereLight as THREEHemisphereLight,
    HemisphereLightHelper
} from 'three';
import { HEMISPHERELIGHT } from './Lights';

const DEFAULT_INTENSITY = 0.5;

const DEFAULT_SKY_COLOR = 0xffffff;
const DEFAULT_GROUND_COLOR = 0x555555;

const GREEN = 0x2ecc71;

export default class HemisphereLight extends Light {

    constructor(options) {
        const {
            color = {
                sky: DEFAULT_SKY_COLOR,
                ground: DEFAULT_GROUND_COLOR,
            },
            intensity = DEFAULT_INTENSITY,
            name,
        } = options;

        super({ color, intensity, name });
        this.options = options;
        this.setLight({ color, intensity });
    }

    setLight({
        light,
        color = {
            sky: DEFAULT_SKY_COLOR,
            ground: DEFAULT_GROUND_COLOR,
        },
        intensity = DEFAULT_INTENSITY
    }) {
        if (light) {
            this.light = light;
        } else {
            const { sky = DEFAULT_SKY_COLOR, ground = DEFAULT_GROUND_COLOR } = color;
            this.light = new THREEHemisphereLight(sky, ground, intensity);
        }

        if (this.hasLight()) {
            this.addToScene();
        }
    }

    addHelper() {
        this.helper = new HemisphereLightHelper(this.light, 2, GREEN);

        Scene.add(this.helper, null, false);
    }

    toJSON() {
        return {
            ...super.toJSON(),
            type: HEMISPHERELIGHT
        }
    }
}
