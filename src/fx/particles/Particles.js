import Fountain from './Fountain';
import Explosion from './Explosion';
import Fire from './Fire';
import Rain from './Rain';
import Snow from './Snow';
import Trail from './Trail';

import Scene from '../../core/Scene';
import Proton from 'three.proton.js';
import { INVALID_EMITTER_ID } from '../../lib/messages';
import { PARTICLE_EMITTER_TYPES } from './constants';
console.log('inside Particles, importing ParticleEmitter');
import ParticleEmitter from './ParticleEmitter';
import ParticleEmitterGroup from './ParticleEmitterGroup';
import ProtonParticleEmitter from './ProtonParticleEmitter';

export const PARTICLES = {
    RAIN: 'rain',
    EXPLOSION: 'explosion',
    FOUNTAIN: 'fountain',
    FIRE: 'fire',
    SNOW: 'snow',
    TRAIL: 'trail'
};

const { SINGLE, GROUP } = PARTICLE_EMITTER_TYPES;
export class Particles {

    constructor() {
        this.map = {
            [PARTICLES.RAIN]: Rain,
            [PARTICLES.EXPLOSION]: Explosion,
            [PARTICLES.FOUNTAIN]: Fountain,
            [PARTICLES.FIRE]: Fire,
            [PARTICLES.SNOW]: Snow,
            [PARTICLES.TRAIL]: Trail
        };

        this.emitters = {};
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
        return this.map[name] || null;
    }

    registerEmitter(key, Emitter) {
        this.map[key] = Emitter;
    }

    isValidEmitter(emitter) {
        return emitter instanceof ParticleEmitter ||
            emitter instanceof ParticleEmitterGroup ||
            emitter instanceof ProtonParticleEmitter;
    }

    addParticleEmitter(_emitter, options = {}) {

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

        this.emitters[emitter.uuid()] = emitter;

        if (emitter.getType() === GROUP) {
            emitter.forEach(singleEmitter => {
                this.handleSingleParticleEmitterCreation(singleEmitter)
            })
        } else {
            this.handleSingleParticleEmitterCreation(emitter);
        }

        return emitter;
    };

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

    isRegisteredEmitter = (name) => typeof name === 'string' && name in this.map;

    hasEmitters = () => this.emitters.length > 0;

    updateEmitters = (dt) => {
        this.toDispose = [];
        Object
            .keys(this.emitters)
            .forEach(uuid => {
                const emitter = this.emitters[uuid];

                // if (emitter.getType() === GROUP) {
                //     emitter.forEach(emitter => this.updateSingleEmitter(emitter, dt));
                // } else {
                //     this.updateSingleEmitter(emitter, dt);
                // }
                this.updateSingleEmitter(emitter, dt);
            });
    }

    updateSingleEmitter(emitter, dt) {
        if (!emitter.isProtonEmitter()) {
            emitter.update(dt);
        }

        if (emitter.isSystemDead()) {
            this.toDispose.push(emitter.uuid);
        }
    }

    disposeDeadEmitters() {
        this.toDispose.forEach(uuid => {
            const emitter = this.emitters[uuid];

            if (emitter.isProtonEmitter()) {
                this.removeProtonEmitter(emitter);
            } else {
                this.emitters[uuid].dispose();
            }

            delete this.emitters[uuid];
        })
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
