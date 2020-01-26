import AudioEngine from '../audio/AudioEngine';
import VideoEngine from '../video/VideoEngine';
import ImagesEngine from '../images/ImagesEngine';
import ModelsEngine from '../models/modelsEngine';
import ShadersEngine from '../fx/shaders/ShadersEngine';
import ParticleEngine from '../fx/particles/ParticleEngine';
import LightEngine from '../lights/LightEngine';
import ScriptsManager from '../scripts/ScriptManager';
import PostProcessingEngine from '../fx/postprocessing/PostProcessingEngine';

const DEFAULT_ASSETS = {
	Audio : {},
	Video : {},
	Images : {},
	Textures: {},
	Models : {},
	Shaders: {},
	Particles: {},
	General : {},
	Scripts: {}
};

export class AssetsManager {

	constructor() {
		this.assets = DEFAULT_ASSETS;
	}

	setAssets(assets = DEFAULT_ASSETS) {
		this.assets = {
			...DEFAULT_ASSETS,
			...assets
		};
	}

	audio() { return this.assets.Audio; }

	video() { return this.assets.Video; }

	images() { return this.assets.Images; }

	textures() { return this.assets.Textures; }

	models() { return this.assets.Models; }

	shaders() { return this.assets.Shaders; }

	particles() { return this.assets.Particles; }

	scripts() { return this.assets.Scripts; }

	general() { return this.assets.General; }

	load = () => {
		return new Promise((resolve, reject) => {
			Promise.all([
				AudioEngine.load(),
				VideoEngine.load(),
				ImagesEngine.load(),
				ModelsEngine.loadModels(),
				ShadersEngine.load(),
				ParticleEngine.load(),
				ScriptsManager.load()
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
	}

	loadingMessage(loaded) {}
}

export default new AssetsManager();
