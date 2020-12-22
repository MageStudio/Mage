import { EventDispatcher } from "three";
import { ParticlesSystem } from 'mage-engine.particles';

import { generateUUID } from '../../lib/uuid';
import Scene from '../../core/Scene';

export default class ParticleEmitter extends EventDispatcher {

    constructor(options = {}) {
        super();

        this.uuid = generateUUID();

        this.system = null;
        this.options = options;

        this.setSystem();
    }

    isProtonEmitter() {
        return false;
    }

    getUUID() {
        return this.uuid;
    }

    hasSystem() {
        return !!this.system;
    }

    isSystemDead() {
        return this.system.finished;
    }

    setSystem() {
        const {
            container = Scene.getScene(),
            autostart = false,
            particles = {},
            system = {}
        } = this.options;

        this.system = new ParticlesSystem({
            container,
            autostart,
            particles,
            system
        });
    }

    getSystem() {
        return this.system;
    }

    setPosition(where) {
        const position = {
            ...this.getPosition(),
            ...where
        };

        this.system.particleSystem.position.set(position.x, position.y, position.z);
    }

    getPosition() {
        return {
            x: this.system.particleSystem.position.x,
            y: this.system.particleSystem.position.y,
            z: this.system.particleSystem.position.z
        };
    }

    setRotation(howmuch) {
        const rotation = {
            ...this.getRotation(),
            ...howmuch
        };

        this.system.particleSystem.rotation.set(rotation.x, rotation.y, rotation.z);
    }

    getRotation() {
        return {
            x: this.system.particleSystem.rotation.x,
            y: this.system.particleSystem.rotation.y,
            z: this.system.particleSystem.rotation.z
        };
    }

    start() {
        if (this.hasSystem()) {
            this.system.start();
        }

        return this;
    }

    update() {
        if (this.hasSystem()) {
            this.system.update();
        }
    }
}