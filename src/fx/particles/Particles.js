import Fountain from './Fountain';
import Explosion from './Explosion';
import Fire from './Fire';
import Rain from './Rain';
import Snow from './Snow';

import { INVALID_EMITTER_ID } from '../../lib/messages';

export const PARTICLES = {
    RAIN: 'rain',
    EXPLOSION: 'explosion',
    FOUNTAIN: 'fountain',
    FIRE: 'fire',
    SNOW: 'snow'
};

export class Particles {

    constructor() {
        this.map = {
            [PARTICLES.RAIN]: Rain,
            [PARTICLES.EXPLOSION]: Explosion,
            [PARTICLES.FOUNTAIN]: Fountain,
            [PARTICLES.FIRE]: Fire,
            [PARTICLES.SNOW]: Snow
        };

        this.emitters = [];
    }

    get(name) {
        return this.map[name] || null;
    }

    registerEmitter(key, Emitter) {
        this.map[key] = Emitter;
    }

    addParticleEmitter(emitterId, options = {}) {
        if (this.isRegisteredEmitter(emitterId)) {
            const Emitter = this.get(emitterId);
            const emitter = new Emitter(options);

            this.emitters.push(emitter);
            return emitter;
        } else {
            console.log(INVALID_EMITTER_ID);
        }
    };

    isRegisteredEmitter = (name) => typeof name === 'string' && name in this.map;

    hasEmitters = () => this.emitters.length > 0;

    update() {
        return new Promise(resolve => {
            if (this.hasEmitters()) {
                this.emitters.forEach(e => e.update());
                resolve();
            }
        })
    }
}

export default new Particles();
