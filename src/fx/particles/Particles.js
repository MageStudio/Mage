import Fountain from "./Fountain";
import Explosion from "./Explosion";
import Fire from "./Fire";
import Rain from "./Rain";
import Snow from "./Snow";
import Trail from "./Trail";

import Scene from "../../core/Scene";
import Proton from "three.proton";
import { DEPRECATIONS, INVALID_EMITTER_ID } from "../../lib/messages";
import { PARTICLE_EMITTER_TYPES } from "./constants";
import ParticleEmitter from "./ParticleEmitter";
import ParticleEmitterGroup from "./ParticleEmitterGroup";
import ProtonParticleEmitter from "./ProtonParticleEmitter";

export const PARTICLES = {
    RAIN: "rain",
    EXPLOSION: "explosion",
    FOUNTAIN: "fountain",
    FIRE: "fire",
    SNOW: "snow",
    TRAIL: "trail",
};

const DEPRECATED_PARTICLES = [PARTICLES.RAIN, PARTICLES.FOUNTAIN, PARTICLES.SNOW];

const { SINGLE, GROUP } = PARTICLE_EMITTER_TYPES;
export class Particles {
    constructor() {
        this.map = new Map();
        this.map.set(PARTICLES.RAIN, Rain);
        this.map.set(PARTICLES.EXPLOSION, Explosion);
        this.map.set(PARTICLES.FOUNTAIN, Fountain);
        this.map.set(PARTICLES.FIRE, Fire);
        this.map.set(PARTICLES.SNOW, Snow);
        this.map.set(PARTICLES.TRAIL, Trail);

        this.emitters = new Map();
        this.toDispose = [];
    }

    init() {
        this.proton = new Proton();
        this.proton.addRender(new Proton.SpriteRender(Scene.getScene()));
    }

    isInitialised() {
        return !!this.proton;
    }

    get(name) {
        return this.map.get(name) || null;
    }

    registerEmitter(key, Emitter) {
        this.map.set(key, Emitter);
    }

    isValidEmitter(emitter) {
        return (
            emitter instanceof ParticleEmitter ||
            emitter instanceof ParticleEmitterGroup ||
            emitter instanceof ProtonParticleEmitter
        );
    }

    addParticleEmitter(emitter, options = {}) {
        console.warn(DEPRECATIONS.PARTICLES_ADD_PARTICLE_EMITTER);
        return this.add(emitter, options);
    }

    add(_emitter, options = {}) {
        if (DEPRECATED_PARTICLES.includes(_emitter)) {
            console.warn(DEPRECATIONS.PARTICLES_OLD);
        }

        let emitter;
        if (this.isRegisteredEmitter(_emitter)) {
            const Emitter = this.get(_emitter);
            emitter = new Emitter(options);
        } else if (this.isValidEmitter(_emitter)) {
            emitter = _emitter;
        } else {
            console.log(INVALID_EMITTER_ID);
            return;
        }

        this.emitters.set(emitter.uuid(), emitter);

        if (emitter.getType() === GROUP) {
            emitter.forEach(singleEmitter => {
                this.handleSingleParticleEmitterCreation(singleEmitter);
            });
        } else {
            this.handleSingleParticleEmitterCreation(emitter);
        }

        return emitter;
    }

    handleSingleParticleEmitterCreation(emitter) {
        if (emitter.isProtonEmitter()) {
            this.addProtonEmitter(emitter);
        }
    }

    addProtonEmitter(emitter) {
        this.proton.addEmitter(emitter.getSystem());
    }

    removeProtonEmitter(emitter) {
        this.proton.removeEmitter(emitter.getSystem());
    }

    isRegisteredEmitter = name => typeof name === "string" && this.map.has(name);

    hasEmitters = () => this.emitters.length > 0;

    updateEmitters = dt => {
        this.toDispose = [];
        this.emitters.forEach(emitter => {
            this.updateSingleEmitter(emitter, dt);
        });
    };

    updateSingleEmitter(emitter, dt) {
        if (!emitter.isProtonEmitter()) {
            emitter.update(dt);
        }

        if (emitter.isSystemDead()) {
            this.toDispose.push(emitter.uuid());
        }
    }

    disposeDeadEmitters() {
        this.toDispose.forEach(uuid => {
            const emitter = this.emitters.get(uuid);

            if (emitter.isProtonEmitter()) {
                this.removeProtonEmitter(emitter);
            } else {
                emitter.dispose();
            }

            this.emitters.delete(uuid);
        });
    }

    update(dt) {
        this.proton.update(dt);
        this.updateEmitters(dt);
        this.disposeDeadEmitters();
    }

    dispose() {
        if (this.isInitialised()) {
            this.proton.destroy();
            this.proton = null;
        }
    }
}

export default new Particles();
