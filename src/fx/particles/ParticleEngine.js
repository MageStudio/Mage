// import { include } from '../../base/util';
// import Rain from './Rain';
// import Clouds from './Clouds';
// import AssetsManager from '../../base/AssetsManager';
//
// export class ParticleEngine {
//
// 	constructor() {
// 		this.PARTICLES_DIR = 'app/particles/';
// 		this.PARTICLES = [];
//
// 		this.map = {
// 			'Rain': Rain,
// 			'Clouds': Clouds
// 		};
// 		this.particles = [];
//
// 		this.particles = {};
// 		this.numParticles  = 0;
// 		this.particlesLoaded  = 0;
// 	}
//
// 	load() {
//
// 		if (AssetsManager.particles()) {
//
// 			const keys = Object.keys(AssetsManager.particles());
//
// 			if (!keys.length) {
// 				return Promise.resolve('particles');
// 			}
//
// 			return Promise.all(keys.map(this.loadSingleFile));
// 		}
//
// 		return Promise.resolve('particles');
// 	}
//
// 	get(id) {
// 		//returning stored particle;
// 		return this.map[id] || false;
// 	}
//
// 	loadSingleFile(id) {
// 		const path = AssetsManager.particles()[id];
// 		// @todo this has to be changed. We can load a M.fx.createparticle file, a custom particle or a threejs particle/material.
// 		const type = path.split(".")[1];
//
// 		return new Promise(resolve => {
// 			if ( type == "js" ) {
// 				include(path.split(".js")[0], resolve);
// 			} else {
// 				const request = new XMLHttpRequest();
// 				request.open("GET", path, true);
// 				request.responseType = "text";
// 				request.onload = (e) => {
// 					var particle = this.parseParticle(request.responseText);
// 					this.map[id] = particle;
// 					this.particlesLoaded++;
// 					resolve();
// 				};
// 				request.send();
// 			}
// 		});
// 	}
//
// 	parseParticle(text) {
// 		var obj = {};
// 		obj.name = text.substring(text.indexOf("<name>")+6, text.indexOf("</name>"));
// 		obj.vertex = text.substring(text.indexOf("<vertex>")+8, text.indexOf("</vertex>"));
// 		obj.fragment = text.substring(text.indexOf("<fragment>")+10, text.indexOf("</fragment>"));
// 		obj.options = {};
// 		obj.attributes = {};
// 		obj.uniforms = {};
// 		return obj;
// 	}
//
// 	create(name, params) {
// 		const obj = {};
//
// 		obj.name = name;
// 		obj.vertex = params.vertex || "";
// 		obj.fragment = params.fragment || "";
// 		obj.options = params.options || {};
// 		obj.attributes = params.attributes || {};
// 		obj.uniforms = params.uniforms || {};
// 		obj.instance = params.instance || false;
//
// 		this.PARTICLES.push(name);
// 		this.map[name] = obj;
// 	}
//
//
//
// 	checkLoad() {
// 		if (this.particlesLoaded == this.numParticles) {
// 			this.assetsManager.completed.particles = true;
// 		}
// 	}
//
// 	add(particle) {
// 		this.PARTICLES.push(particle);
// 	}
// }
//
// export default new ParticleEngine();

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

	hasEmitters = () => {
		return this.emitters.length > 0;
	};

	update() {
		if (this.hasEmitters()) {
			this.emitters.forEach(e => e.update());
		}
	}
}

export default new ParticleEngine();
