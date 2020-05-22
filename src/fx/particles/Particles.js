import Fountain from './Fountain';
import Explosion from './Explosion';
import { INVALID_EMITTER_ID } from '../../lib/messages';

export class Particles {

	constructor() {
		this.map = {
			'Explosion': Explosion,
			'Fountain': Fountain
		};

		this.emitters= [];
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
		if (this.hasEmitters()) {
			this.emitters.forEach(e => e.update());
		}
	}
}

export default new Particles();
