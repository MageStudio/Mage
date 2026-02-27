import Light from "./light";
import Scene from "../core/Scene";
import { HemisphereLight as THREEHemisphereLight, HemisphereLightHelper } from "three";
import { ENTITY_TYPES } from "../entities/constants";
import { generateRandomName } from "../lib/uuid";
import { serializeColor } from "../lib/meshUtils";

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
        this.setEntityType(ENTITY_TYPES.LIGHT.TYPE);
        this.setEntitySubtype(ENTITY_TYPES.LIGHT.SUBTYPES.HEMISPHERE);
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
        if (sky !== undefined) {
            if (typeof sky === 'object' && 'r' in sky && 'g' in sky && 'b' in sky) {
                this.getBody().color.setRGB(sky.r, sky.g, sky.b);
            } else {
                this.getBody().color.set(sky);
            }
        }
        if (ground !== undefined) {
            if (typeof ground === 'object' && 'r' in ground && 'g' in ground && 'b' in ground) {
                this.getBody().groundColor.setRGB(ground.r, ground.g, ground.b);
            } else {
                this.getBody().groundColor.set(ground);
            }
        }
    };

    getColor = () => {
        return {
            sky: this.getBody().color,
            ground: this.getBody().groundColor,
        };
    };

    addHelpers({ holderName = "hemispherelightholder", holderSize = 0.05 } = {}) {
        this.helper = new HemisphereLightHelper(this.getBody(), 2, GREEN);

        // Set to layer 1 ONLY so mirrors don't render light helpers
        // Disable depth test so helpers always render on top of sky/water
        const setMaterialDepth = (material) => {
            if (!material) return;
            const mats = Array.isArray(material) ? material : [material];
            mats.forEach(mat => {
                mat.depthTest = false;
                mat.depthWrite = false;
                mat.transparent = true;
                mat.needsUpdate = true;
            });
        };

        this.helper.layers.set(1);
        this.helper.renderOrder = 999;
        setMaterialDepth(this.helper.material);
        this.helper.traverse(child => {
            child.layers.set(1);
            child.renderOrder = 999;
            setMaterialDepth(child.material);
        });

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
        const color = this.getColor();
        return {
            ...super.toJSON(parseJSON),
            color: parseJSON
                ? { sky: serializeColor(color.sky), ground: serializeColor(color.ground) }
                : color,
        };
    }

    static create(data = {}) {
        const { color, intensity, name, position } = data;
        return new HemisphereLight({ color, intensity, name, position });
    }
}
