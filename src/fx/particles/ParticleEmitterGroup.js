import { Object3D } from "three";
import { EMITTER_NOT_FOUND } from "../../lib/messages";
import { PARTICLE_EMITTER_TYPES } from "./constants";
import { Entity, ENTITY_TYPES } from "../../entities";
import Scene from "../../core/Scene";

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
        this.setName(name);
        this.setEntityType(ENTITY_TYPES.PARTICLE);
    }

    setBody({ body }) {
        this.body = body;

        if (this.hasBody()) {
            this.addToScene();
        }
    }

    addToScene() {
        const {
            addUniverse = true,
        } = this.options;

        if (this.hasBody()) {
            Scene.add(this.getBody(), this, addUniverse);
        } else {
            console.warn(ELEMENT_NOT_SET);
        }
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
            this.add(emitter);
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
        Object
            .keys(this.system)
            .forEach(k => {
                cb(this.system[k]);
            })
    }

    emit(...options) {
        if (this.hasSystem()) {
            Object.keys(this.system)
                .forEach(emitterId => this.system[emitterId].emit(...options));
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

    update(dt) {
        super.update(dt);

        if (this.hasSystem()) {
            Object.keys(this.system)
                .forEach(emitterId => this.system[emitterId].update(dt));
        }
    }
}