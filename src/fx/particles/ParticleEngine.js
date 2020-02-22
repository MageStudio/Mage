import Fountain from './Fountain';

export class ParticleEngine {

	constructor() {
		this.map = {
			'Fountain': Fountain
		};

		this.emitters= [];
	}

	get(name) {
		return this.map[name] || null;
	}

	addParticleEmitter(emitter) {
		this.emitters.push(emitter);
	};

	hasEmitters = () => this.emitters.length > 0;

	update() {
		if (this.hasEmitters()) {
			this.emitters.forEach(e => e.update());
		}
	}
}

export default new ParticleEngine();
