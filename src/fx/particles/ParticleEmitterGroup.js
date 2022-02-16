import { EventDispatcher } from "three";

import { generateUUID } from '../../lib/uuid';
import Scene from '../../core/Scene';
import { EMITTER_NOT_FOUND } from "../../lib/messages";
import { PARTICLE_EMITTER_TYPES } from "./constants";

export default class ParticleEmitterGroup extends EventDispatcher {

    constructor(options = {}) {
        super();

        const { name, system } = options;

        this.uuid = generateUUID();
        this.name = name || `emitter_group_${this.uuid.slice(0, 4)}`;

        this.system = {};
        this.options = options;

        this.setSystem(system);
    }

    isProtonEmitter() {
        Object.keys(this.system)
                .forEach(emitterId => this.system[emitterId].isProtonEmitter());
    }

    getType() {
        return PARTICLE_EMITTER_TYPES.GROUP;
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
        return !!this.system && !!Object.keys(this.system).length;
    }

    isSystemDead() {
        Object.keys(this.system)
                .forEach(emitterId => this.system[emitterId].isSystemDead());
    }

    setSystem(system = []) {
        this.system = system.reduce((system, emitter) => {
            system[emitter.getName()] = emitter;
            return system;
        }, {});
    }

    getSystem() {
        return this.system;
    }

    getEmitter(name) {
        const emitter = this.system[name];

        if (emitter) {
            return emitter;
        } else {
            console.log(EMITTER_NOT_FOUND, name);
        }
    }

    forEach(cb) {
        Object.keys(this.system)
            .forEach((emitterId, i) => cb(this.system[emitterId], i));
    }

    setPosition(where) {
        if (this.hasSystem()) {
            const position = {
                ...this.getPosition(),
                ...where
            };

            Object.keys(this.system)
                .forEach(emitterId => this.system[emitterId].setPosition(position));
        }

        return this;
    }

    getPosition() {
        if (this.hasSystem()) {
            const first = Object.keys(this.system)[0];
            return this.system[first].getPosition();
        }
    }

    setRotation(howmuch) {
        if (this.hasSystem()) {
            const rotation = {
                ...this.getRotation(),
                ...howmuch
            };

            Object.keys(this.system)
                .forEach(emitterId => this.system[emitterId].setRotation(rotation));
        }

        return this;
    }

    getRotation() {
        if (this.hasSystem()) {
            const first = Object.keys(this.system)[0];
            return this.system[first].getRotation();
        }
    }

    start(...options) {
        if (this.hasSystem()) {
            Object.keys(this.system)
                .forEach(emitterId => this.system[emitterId].start(...options));
        }
    }

    dispose() {
        Object.keys(this.system)
                .forEach(emitterId => this.system[emitterId].dispose());
    }

    update(dt) {
        if (this.hasSystem()) {
            Object.keys(this.system)
                .forEach(emitterId => this.system[emitterId].update(dt));
        }
    }
}