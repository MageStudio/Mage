import Fountain from '../fx/particles/Fountain';
import Explosion from '../fx/particles/Explosion';
import Fire from '../fx/particles/Fire';
import Rain from '../fx/particles/Rain';
import Snow from '../fx/particles/Snow';

import Proton from 'three.proton.js';
import { INVALID_EMITTER_ID } from '../lib/messages';

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

        this.emitters = {};
        this.toDispose = [];
    }

    init(scene) {
        this.proton = new Proton();
        this.proton.addRender(new Proton.SpriteRender(scene));
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

            this.emitters[emitter.getUUID()] = emitter;

            if (emitter.isProtonEmitter()) {
                this.addProtonEmitter(emitter);
            }

            return emitter;
        } else {
            console.log(INVALID_EMITTER_ID);
        }
    };

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
                if (!emitter.isProtonEmitter()) {
                    emitter.update(dt);
                }

                if (emitter.isSystemDead()) {
                    this.toDispose.push(uuid);
                }
            });
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
        this.proton.destroy();
    }
}
 
export default Particles;
