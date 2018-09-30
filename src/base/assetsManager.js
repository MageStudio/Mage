import AudioEngine from '../audio/AudioEngine';
import VideoEngine from '../video/VideoEngine';
import ImagesEngine from '../images/ImagesEngine';
import ModelsEngine from '../models/ModelsEngine';
import ShadersEngine from '../fx/shaders/ShadersEngine';

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
	}

	load(callback) {

		return Promise.all([
			this.audioEngine.load(),
			this.videoEngine.load(),
			this.imagesEngine.load(),
			this.modelsEngine.load(),
			this.shadersEngine.load()
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
