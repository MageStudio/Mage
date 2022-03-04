import { EMITTER_NOT_FOUND } from "../../lib/messages";
import { PARTICLE_EMITTER_TYPES } from "./constants";
import { Entity, ENTITY_TYPES } from "../../entities";

export default class ParticleEmitterGroup extends Entity {

    constructor(options = {}) {
        super({ tag: 'particle '});

        const {
            name = `emitter_${Math.random()}`,
            system
        } = options;

        this.options = {
            ...options,
            name
        };

        this.setSystem(system);
        this.setBody({ body: new Object3D() });
        this.setEntityType(ENTITY_TYPES.PARTICLE);
    }

    isProtonEmitter() {
        Object.keys(this.system)
                .forEach(emitterId => this.system[emitterId].isProtonEmitter());
    }

    getType() {
        return PARTICLE_EMITTER_TYPES.GROUP;
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

    emit(...options) {
        if (this.hasSystem()) {
            Object.keys(this.system)
                .forEach(emitterId => this.system[emitterId].start(...options));
        }
    }

    stop() {
        if (this.hasSystem()) {
            Object.keys(this.system)
                .forEach(emitterId => this.system[emitterId].stop());
        }
    }

    dispose() {
        super.dispose();
        Object.keys(this.system)
                .forEach(emitterId => this.system[emitterId].dispose());
    }

    syncParticleEmitter() {
        if (this.hasSystem()) {
            const { position, rotation } = this.getBody();

            Object.keys(this.system)
                .forEach(emitterId => this.system[emitterId].setPosition(position));
            Object.keys(this.system)
                .forEach(emitterId => this.system[emitterId].setRotation(rotation));
        }
    }

    update(dt) {
        super.update(dt);

        if (this.hasSystem()) {
            Object.keys(this.system)
                .forEach(emitterId => this.system[emitterId].update(dt));
        }

        this.syncParticleEmitter();
    }
}