import Light from './Light';
import Scene from '../core/Scene';
import {
    HemisphereLight as THREEHemisphereLight,
    HemisphereLightHelper
} from 'three';
import { HEMISPHERELIGHT } from './Lights';
import { ENTITY_TYPES } from '../entities/constants';
import { generateRandomName } from '../lib/uuid';

const DEFAULT_INTENSITY = 0.5;

const DEFAULT_SKY_COLOR = 0xffffff;
const DEFAULT_GROUND_COLOR = 0x555555;

const GREEN = 0x2ecc71;

export default class HemisphereLight extends Light {

    constructor(options = {}) {
        const {
            color = {
                sky: DEFAULT_SKY_COLOR,
                ground: DEFAULT_GROUND_COLOR,
            },
            intensity = DEFAULT_INTENSITY,
            name = generateRandomName('HemisphereLight'),
        } = options;

        super({ color, intensity, name });
        this.options = options;
        this.setLight({ color, intensity });
        this.setEntityType(ENTITY_TYPES.LIGHT.HEMISPHERE);
        this.setName(name);
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
            this.setBody(light)
        } else {
            const { sky = DEFAULT_SKY_COLOR, ground = DEFAULT_GROUND_COLOR } = color;
            this.setBody(new THREEHemisphereLight(sky, ground, intensity));
        }

        if (this.hasBody()) {
            this.addToScene();
        }
    }

    addHelper() {
        this.helper = new HemisphereLightHelper(this.body, 2, GREEN);

        Scene.add(this.helper, null, false);
    }

    toJSON() {
        return {
            ...super.toJSON(),
            type: HEMISPHERELIGHT
        }
    }
}
