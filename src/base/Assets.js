import Audio from '../audio/Audio';
import Video from '../video/Video';
import Images from '../images/Images';
import Models from '../models/Models';
import Shaders from '../fx/shaders/Shaders';
import Particles from '../fx/particles/Particles';
import Lights from '../lights/Lights';
import Scripts from '../scripts/Scripts';
import PostProcessing from '../fx/postprocessing/PostProcessing';

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

export class Assets {

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
				Audio.load(this.audio()),
				Video.load(this.video()),
				Images.load(this.images(), this.textures()),
				Models.loadModels(this.models()),
				Shaders.load(this.shaders()),
				Scripts.load(this.scripts())
			]).then(() => {
				resolve();
				this.loadingMessage(true);
			}).catch((e) => {
				reject(e);
				this.loadingMessage(false);
			});
		})
	}

	update(dt) {
		Audio.update(dt);
		Lights.update(dt);
		Particles.update(dt);
	}

	loadingMessage(loaded) {}
}

export default new Assets();
