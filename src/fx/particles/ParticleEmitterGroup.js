import { Object3D } from "three";
import { EMITTER_NOT_FOUND } from "../../lib/messages";
import { PARTICLE_EMITTER_TYPES } from "./constants";
import Entity from "../../entities/Entity";
import { ENTITY_TYPES } from "../../entities/constants";
import Scene from "../../core/Scene";
import { generateRandomName } from "../../lib/uuid";

export default class ParticleEmitterGroup extends Entity {
    constructor(options = {}) {
        super({ tag: "particle " });

        const { name = generateRandomName("EmitterGroup"), system } = options;

        this.options = {
            ...options,
            name,
        };
        this.system = new Map();

        this.setBody({ body: new Object3D() });
        this.setName(name);
        this.setEntityType(ENTITY_TYPES.PARTICLE.TYPE);
        this.setEntitySubtype(ENTITY_TYPES.PARTICLE.SUBTYPES.EMITTER_GROUP);
        this.setSystem(system);
    }

    setBody({ body }) {
        this.body = body;

        if (this.hasBody()) {
            this.addToScene();
        }
    }

    addToScene() {
        const { addUniverse = true } = this.options;

        if (this.hasBody()) {
            Scene.add(this.getBody(), this, addUniverse);
        } else {
            console.warn(ELEMENT_NOT_SET);
        }
    }

    isProtonEmitter() {
        this.system.forEach(emitter => emitter.isProtonEmitter());
    }

    getType() {
        return PARTICLE_EMITTER_TYPES.GROUP;
    }

    hasSystem() {
        return !!this.system && !!this.system.size > 0;
    }

    isSystemDead() {
        this.system.forEach(emitter => emitter.isSystemDead());
    }

    setSystem(system = []) {
        system.forEach(emitter => {
            this.add(emitter);
            this.system.set(emitter.getName(), emitter);
        });
    }

    getSystem() {
        return this.system;
    }

    getEmitter(name) {
        const emitter = this.system.get(name);

        if (emitter) {
            return emitter;
        } else {
            console.log(EMITTER_NOT_FOUND, name);
        }
    }

    forEach(cb) {
        this.system.forEach(emitter => cb(emitter));
    }

    emit(...options) {
        if (this.hasSystem()) {
            this.system.forEach(emitter => emitter.emit(...options));
        }
    }

    stop() {
        if (this.hasSystem()) {
            this.system.forEach(emitter => emitter.stop());
        }
    }

    dispose() {
        super.dispose();
        this.system.forEach(emitter => emitter.dispose());
    }

    update(dt) {
        super.update(dt);

        if (this.hasSystem()) {
            this.system.forEach(emitter => emitter.update(dt));
        }
    }
}
