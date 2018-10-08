import { include } from '../../base/util';

import Atmosphere from '../materials/Atmosphere';
import Mirror from '../materials/Mirror';
import Ocean from '../materials/Ocean';
import OceanShaders from '../materials/OceanShaders';
import Skybox from '../scenery/Skybox';

export class ShadersEngine {

	constructor() {
		this.SHADERS_DIR = "app/shaders/";
		this.SHADERS = [];

		this.map = {
			Atmosphere,
			Mirror,
			Ocean,
			OceanShaders,
			Skybox
		};

		this.shaders = [];

		this.numShaders = 0;
		this.shadersLoaded = 0;
	}

	load() {
		if (Assets.Shaders) {
			const keys = Object.keys(Assets.Shaders);
			if (!keys.length) {
				return Promise.resolve('shaders');
			}
			return Promise.all(keys.map(this.loadSingleFile));
		}
		return Promise.resolve('shaders');
	}

	get(id) {
		return this.map[id] || false;
	}

	loadSingleFile(id) {
		const path = Assets.Shaders[id];
		const type = path.split(".")[1];

		return new Promise(resolve => {
			if ( type == "js" ) {
				include(path.split(".js")[0], resolve);
			} else {
				const request = new XMLHttpRequest();
				request.open("GET", path, true);
				request.responseType = "text";
				request.onload = (e) => {
					const shader = this.parseShader(request.responseText);
					this.map[id] = shader;
					this.shadersLoaded++;
					resolve();
				};
				request.send();
			}
		});
	}

	parseShader(text) {
		return {
			name: text.substring(text.indexOf("<name>") + 6, text.indexOf("</name>")),
			vertex: text.substring(text.indexOf("<vertex>") + 8, text.indexOf("</vertex>")),
			fragment: text.substring(text.indexOf("<fragment>") + 10, text.indexOf("</fragment>")),
			options: {},
			attributes: {},
			uniforms: {}
		}
	}

	create(name, params) {
		this.SHADERS.push(name);
		this.map.put(name, {
			name,
			vertex: params.vertex || "",
			fragment: params.fragment || "",
			options: params.options || {},
			attributes: params.attributes || {},
			uniforms: params.uniforms || {},
			instance: params.instance || false
		});
	}

	add(shader) {
		this.shaders.push(shader);
	}
}

export default new ShadersEngine();
