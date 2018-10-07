import AudioEngine from '../audio/AudioEngine';
import VideoEngine from '../video/VideoEngine';
import ImagesEngine from '../images/ImagesEngine';
import ModelsEngine from '../models/ModelsEngine';
import ShadersEngine from '../fx/shaders/ShadersEngine';
import ParticleEngine from '../fx/particles/ParticleEngine';

import LightEngine from '../lights/LigthEngine';

export default class Manager {

	constructor() {
		// this.completed = {
		// 	sound: false,
		// 	video: true,
		// 	images: false,
		// 	models: false,
		// 	shaders: false
		// }

		// this.audio = new AudioEngine(this);
		// this.video = new VideoEngine(this);
		// this.images = new ImagesEngine(this);
		// this.models = new ModelsEngine(this);
		// this.shaders = new ShadersEngine(this);
		// this.particles = new ParticleEngine(this);

		this.lights = new LightEngine();
	}

	load() {
		return new Promise((resolve, reject) => {
			Promise.all([
				AudioEngine.load(),
				VideoEngine.load(),
				ImagesEngine.load(),
				ModelsEngine.load(),
				ShadersEngine.load(),
				ParticleEngine.load()
			]).then(() => {
				resolve();
				this.loadingMessage(true);
			}).catch((e) => {
				reject(e);
				this.loadingMessage(false);
			});
		})
	}

	update() {
		AudioEngine.update();
		this.lights.update();
	}

	loadingMessage(loaded) {}
}
