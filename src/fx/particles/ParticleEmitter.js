import { EventDispatcher } from "three";
import { ParticlesSystem } from 'mage-engine.particles';

import { generateUUID } from '../../lib/uuid';
import Scene from '../../core/Scene';
import { PARTICLE_EMITTER_TYPES } from "./constants";

export default class ParticleEmitter extends EventDispatcher {

    constructor(options = {}) {
        super();

        const { name } = options;

        this.uuid = generateUUID();
        this.name = name || `emitter_${this.uuid.slice(0, 4)}`;

        this.system = null;
        this.options = options;

        this.setSystem();
    }

    isProtonEmitter() {
        return false;
    }

    getType() {
        return PARTICLE_EMITTER_TYPES.SINGLE;
    }

    getUUID() {
        return this.uuid;
    }

    getName() {
        return this.name;
    }

    setName(name) {
        this.name = name;
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

    start(...options) {
        if (this.hasSystem()) {
            this.system.start(...options);
        }

        return this;
    }

    update(dt) {
        if (this.hasSystem()) {
            this.system.update(dt);
        }
    }
}