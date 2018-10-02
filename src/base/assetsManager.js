import AudioEngine from '../audio/AudioEngine';
import VideoEngine from '../video/VideoEngine';
import ImagesEngine from '../images/ImagesEngine';
import ModelsEngine from '../models/ModelsEngine';
import ShadersEngine from '../fx/shaders/ShadersEngine';
import ParticleEngine from '../fx/particles/ParticleEngine';

export default class AssetsManager {

	constructor() {
		this.completed = {
			sound: false,
			video: true,
			images: false,
			models: false,
			shaders: false
		}

		this.audioEngine = new AudioEngine(this);
		this.videoEngine = new VideoEngine(this);
		this.imagesEngine = new ImagesEngine(this);
		this.modelsEngine = new ModelsEngine(this);
		this.shadersEngine = new ShadersEngine(this);
		this.particlesEngine = new ParticleEngine(this);
	}

	load(callback) {

		return Promise.all([
			this.audioEngine.load(),
			this.videoEngine.load(),
			this.imagesEngine.load(),
			this.modelsEngine.load(),
			this.shadersEngine.load(),
			this.particlesEngine.load()
		]).then(() => {
			callback();
			this.loadingMessage(true);
		}).catch((e) => {
			callback(e);
			this.loadingMessage(false);
		});
	}

	loadingMessage(loaded) {}
}
