import AudioEngine from '../audio/AudioEngine';
import VideoEngine from '../video/VideoEngine';
import ImagesEngine from '../images/ImagesEngine';
import ModelsEngine from '../models/ModelsEngine';
import ShadersEngine from '../fx/shaders/ShadersEngine';
import ParticleEngine from '../fx/particles/ParticleEngine';
import LightEngine from '../lights/LightEngine';
import PostProcessingEngine from '../fx/postprocessing/PostProcessingEngine';

export default class Manager {

	constructor() {}

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
		LightEngine.update();
		PostProcessingEngine.update();

	}

	loadingMessage(loaded) {}
}
