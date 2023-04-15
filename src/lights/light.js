import { ENTITY_TYPES } from "../entities/constants";
import Entity from "../entities/Entity";

import Lights from "./Lights";
import Scene from "../core/Scene";
import { TAGS } from "../lib/constants";
import { LIGHT_HOLDER_MODEL_NOT_FOUND, LIGHT_NOT_FOUND } from "../lib/messages";
import { generateRandomName } from "../lib/uuid";
import { tweenTo } from "../lib/easing";
import HelperSprite from "../entities/base/HelperSprite";

export default class Light extends Entity {
    constructor({ color, intensity, name }) {
        super({ name });
        this.color = color;
        this.intensity = intensity;
        this.name = name || generateRandomName("Light");
        this.isLightOn = false;
        this.body = undefined;

        // helper body for this light
        this.isUsingHelper = undefined;
        // holder body representing the light
        this.holder = undefined;
        // target body for the light (only used by directional light)
        this.target = undefined;

        this.setEntityType(ENTITY_TYPES.LIGHT.DEFAULT);

        Lights.add(this);
    }

    addToScene() {
        if (this.hasBody()) {
            Scene.add(this.body, this);
        }
    }

    addHolder = (name = "lightholder", size = 0.05) => {
        const holderSprite = new HelperSprite(size, size, name, { name });

        if (holderSprite) {
            holderSprite.setSizeAttenuation(false);
            holderSprite.setDepthTest(false);
            holderSprite.setDepthWrite(false);
            holderSprite.setSerializable(false);
            holderSprite.setPosition(this.getPosition());
            holderSprite.addTags([TAGS.LIGHTS.HELPER, TAGS.LIGHTS.HOLDER, name]);

            holderSprite.setHelperTarget(this);

            this.holder = holderSprite;

            return true;
        } else {
            console.warn(LIGHT_HOLDER_MODEL_NOT_FOUND);
            return false;
        }
    };

    addTargetHolder = (name = "targetholder", size = 0.05) => {
        const targetSprite = new HelperSprite(size, size, name, { name });

        if (targetSprite) {
            targetSprite.setSizeAttenuation(false);
            targetSprite.setDepthTest(false);
            targetSprite.setDepthWrite(false);
            targetSprite.setSerializable(false);
            targetSprite.setPosition(this.getTargetPosition());
            targetSprite.addTags([TAGS.LIGHTS.HELPER, TAGS.LIGHTS.TARGET, name]);

            targetSprite.setHelperTarget(this);

            targetSprite.getBody().add(this.getBody().target);

            this.targetHolder = targetSprite;
        }
    };

    usingHelper() {
        return !!this.isUsingHelper;
    }

    hasHolder() {
        return !!this.holder;
    }

    hasTarget() {
        return false;
    }

    getPosition() {
        return {
            x: this.body.position.x,
            y: this.body.position.y,
            z: this.body.position.z,
        };
    }

    setPosition(where, { updateHolder = true } = {}) {
        const position = {
            ...this.getPosition(),
            ...where,
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
            this.intensity = value;
        }
    }

    getIntensity() {
        if (this.hasBody()) {
            return this.body.intensity;
        }
    }

    setColor(color) {
        this.body.color = color;
    }

    getColor() {
        return this.body.color;
    }

    dim(value = this.getIntensity(), time = 250) {
        const intensity = this.getIntensity();
        const onUpdate = value => !this.isDisposed() && this.setIntensity(value);
        return tweenTo(intensity, value, { time, onUpdate });
    }

    on(time = 500) {
        if (this.hasBody()) {
            this.dim(this.intensity, time).then(() => (this.isLightOn = true));
        } else {
            console.log(LIGHT_NOT_FOUND);
        }
    }

    off(time = 500) {
        if (this.hasBody()) {
            this.dim(0, time).then(() => (this.isLightOn = false));
        } else {
            console.log(LIGHT_NOT_FOUND);
        }
    }

    toJSON() {
        return {
            ...super.toJSON(),
            type: this.getEntityType(),
            color: this.getColor(),
            intensity: this.getIntensity(),
            name: this.getName(),
        };
    }
}
