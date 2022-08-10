import Light from './Light';
import { AmbientLight as THREEAmbientLight } from 'three';
import { AMBIENTLIGHT } from './Lights';
import { ENTITY_TYPES } from '../entities/constants';
import { generateRandomName } from '../lib/uuid';

const DEFAULT_POSITION = { x: 0, y: 0, z: 0 };
const DEFAULT_INTENSITY = 0.5;
const WHITE = 0xffffff;

export default class AmbientLight extends Light {

    constructor(options = {}) {
        const {
            color = WHITE,
            intensity = DEFAULT_INTENSITY,
            name = generateRandomName('AmbientLight')
        } = options;
        super({ color, intensity, name });

        this.options = options;
        this.setLight({ color, intensity });
        this.setEntityType(ENTITY_TYPES.LIGHT.AMBIENT);
        this.setName(name);
    }

    setLight({
        light,
        color = WHITE,
        intensity = DEFAULT_INTENSITY
    }) {
        if (light) {
            this.setBody({ body: light });
        } else {
            this.setBody({ body: new THREEAmbientLight(color, intensity) });
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
}
