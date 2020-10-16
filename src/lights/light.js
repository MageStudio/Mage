import { Entity, ENTITY_TYPES } from '../entities';

import Lights from './Lights';
import Models from '../models/Models';
import Scene from '../core/Scene';
import { MATERIALS } from '../lib/constants';

const LAMP_COLOR = 0Xf1c40f;

export default class Light extends Entity {

    constructor({ color, intensity, name }) {
        super({ name });
        this.color = color;
        this.intensity = intensity;
        this.name = name || `light_${Math.random() * 1000}`;
        this.isLightOn = false;
        this.body = undefined;

        // helper body for this light
        this.helper = undefined;
        // holder body representing the light
        this.holder = undefined;
        // target body for the light (only used by directional light)
        this.target = undefined;

        this.setEntityType(ENTITY_TYPES.LIGHT);

        Lights.add(this);
    }

    addToScene() {
        if (this.hasLight()) {
            Scene.add(this.light, this);
        }
    }

    addHolder =(name = 'lightholder') => {
        const body = Models.getModel(name);

        if (body) {
            this.holder = body;
            this.holder.setMaterialFromName(MATERIALS.BASIC, { wireframe: true, color: LAMP_COLOR });
            this.holder.serializable = false;
            this.holder.setPosition({
                x: this.light.position.x,
                y: this.light.position.y,
                z: this.light.position.z
            });
        } else {
            console.warn('[Mage] Couldnt load the lamp holder.');
        }
    };

    hasLight() {
        return !!this.light;
    }

    hasHelper() {
        return !!this.helper;
    }

    hasHolder() {
        return !!this.holder;
    }

    getPosition() {
        return {
            x: this.light.position.x,
            y: this.light.position.y,
            z: this.light.position.z
        };
    }

    setPosition(where, { updateHolder = true } = {}) {
        const position = {
            ...this.getPosition(),
            ...where
        };

        const { x, y, z } = position;

        if (this.light) {
            this.light.position.set(x, y, z);
        }

        if (this.hasHolder() & updateHolder) {
            this.holder.setPosition({ x, y, z });
        }
    }    

    isAlreadyOn() {
        return this.light && this.light.intensity === this.intensity;
    }

    isAlreadyOff() {
        return this.light && this.light.intensity <= 0;
    }

    setIntensity(value) {
        if (this.light) {
            this.light.intensity = value;
        }
    }

    dim(value, speed, factor) {
        // goes to value decreasing by factor. It takes speed ms to get to value.
        console.warn('[Mage] Not implemented.', value, speed, factor);
    }

    on() {
        if (this.light) {
            const delay = () => {
                this.light.intensity += Lights.delayFactor;
                if (this.light.intensity < this.intensity) {
                    setTimeout(delay, Lights.delayStep);
                } else {
                    this.isLightOn = true;
                }
            }
            delay();
        } else {
            console.log("[Mage] You should create your light, first");
        }
    }

    off() {
        if (this.light) {
            const delay = () => {
                this.light.intensity -= Lights.delayFactor;
                if (this.light.intensity > 0) {
                    setTimeout(delay, Lights.delayStep);
                } else {
                    this.isLightOn = false;
                }
            }
            delay();
        } else {
            console.log("[Mage] You should create your light, first");
        }
    }

    toJSON() {
        const { x, y, z } = this.light.position;

        return {
            position: { x, y, z },
            color: this.color,
            intensity: this.intensity,
            name: this.name
        }
    }
};
