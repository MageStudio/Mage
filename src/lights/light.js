import Between from 'between.js';
import { ENTITY_TYPES } from '../entities/constants';
import Entity from '../entities/Entity';

import Lights from './Lights';
import Models from '../models/Models';
import Scene from '../core/Scene';
import { MATERIALS } from '../lib/constants';
import {
    LIGHT_HOLDER_MODEL_NOT_FOUND,
    LIGHT_NOT_FOUND
} from '../lib/messages';

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
        if (this.hasBody()) {
            Scene.add(this.body, this);
        }
    }

    addHolder =(name = 'lightholder') => {
        const body = Models.getModel(name);

        if (body) {
            this.holder = body;
            this.holder.setMaterialFromName(MATERIALS.BASIC, { wireframe: true, color: LAMP_COLOR });
            this.holder.serializable = false;
            this.holder.setPosition({
                x: this.body.position.x,
                y: this.body.position.y,
                z: this.body.position.z
            });
        } else {
            console.warn(LIGHT_HOLDER_MODEL_NOT_FOUND);
        }
    };

    hasHelper() {
        return !!this.helper;
    }

    hasHolder() {
        return !!this.holder;
    }

    getPosition() {
        return {
            x: this.body.position.x,
            y: this.body.position.y,
            z: this.body.position.z
        };
    }

    setPosition(where, { updateHolder = true } = {}) {
        const position = {
            ...this.getPosition(),
            ...where
        };

        const { x, y, z } = position;

        if (this.hasBody()) {
            this.body.position.set(x, y, z);
        }

        if (this.hasHolder() & updateHolder) {
            this.holder.setPosition({ x, y, z });
        }
    }    

    isAlreadyOn() {
        return this.hasBody() && this.body.intensity === this.intensity;
    }

    isAlreadyOff() {
        return this.hasBody() && this.body.intensity <= 0;
    }

    setIntensity(value) {
        if (this.hasBody()) {
            this.body.intensity = value;
        }
    }

    getIntensity() {
        if (this.hasBody()) {
            return this.body.intensity;
        }
    }

    dim(value = this.getIntensity(), time) {
        const intensity = this.getIntensity();
        return new Promise((resolve) => 
            new Between(intensity, value)
                .time(time)
                .on('update', value => this.setIntensity(value))
                .on('complete', resolve)
        );
    }

    on(time = 500) {
        if (this.hasBody()) {
            this.dim(this.intensity, time)
                .then(() => this.isLightOn = true);
        } else {
            console.log(LIGHT_NOT_FOUND);
        }
    }

    off(time = 500) {
        if (this.hasBody()) {
            this.dim(0, time)
                .then(() => this.isLightOn = false)
        } else {
            console.log(LIGHT_NOT_FOUND);
        }
    }

    toJSON() {
        const { x, y, z } = this.body.position;

        return {
            position: { x, y, z },
            color: this.color,
            intensity: this.intensity,
            name: this.name
        }
    }
};
