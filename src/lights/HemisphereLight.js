import Light from "./light";
import Scene from "../core/Scene";
import { HemisphereLight as THREEHemisphereLight, HemisphereLightHelper } from "three";
import { ENTITY_TYPES } from "../entities/constants";
import { generateRandomName } from "../lib/uuid";

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
            name = generateRandomName("HemisphereLight"),
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
        intensity = DEFAULT_INTENSITY,
    }) {
        if (light) {
            this.setBody({ body: light });
        } else {
            const { sky = DEFAULT_SKY_COLOR, ground = DEFAULT_GROUND_COLOR } = color;
            this.setBody({ body: new THREEHemisphereLight(sky, ground, intensity) });
        }

        if (this.hasBody()) {
            this.addToScene();
        }
    }

    setColor = ({ sky, ground } = {}) => {
        this.getBody().color = sky;
        this.getBody().groundColor = ground;
    };

    getColor = () => {
        return {
            sky: this.getBody().color,
            ground: this.getBody().groundColor,
        };
    };

    addHelpers({ holderName = "hemispherelightholder", holderSize = 0.05 } = {}) {
        this.helper = new HemisphereLightHelper(this.getBody(), 2, GREEN);
        this.addHolder(holderName, holderSize);

        this.isUsingHelper = true;

        Scene.add(this.helper, null, false);
    }

    update(dt) {
        super.update(dt);
        if (this.usingHelper()) {
            this.setPosition(this.holder.getPosition(), { updateHolder: false });
        }
    }

    toJSON(parseJSON = false) {
        return {
            ...super.toJSON(parseJSON),
            color: this.getColor(),
        };
    }
}
