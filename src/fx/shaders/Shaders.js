import Atmosphere from '../materials/Atmosphere';
import Mirror from '../materials/Mirror';
import Ocean from '../materials/Ocean';
import Water from '../materials/Water';
import OceanShaders from '../materials/OceanShaders';
import Skybox from '../scenery/Skybox';
import Sky from '../scenery/Sky';

export class Shaders {

	constructor() {
		this.map = {
			Atmosphere,
			Mirror,
			Ocean,
			OceanShaders,
			Skybox,
			Sky,
			Water
		};

		this.shaders = {};

		this.numShaders = 0;
		this.shadersLoaded = 0;
	}

	get = (id) => {
		return this.map[id] || false;
	}

	create(name, params) {
		this.map[name] = {
			name,
			vertex: params.vertex || "",
			fragment: params.fragment || "",
			options: params.options || {},
			attributes: params.attributes || {},
			uniforms: params.uniforms || {},
			instance: params.instance || false
		};
	}

	add(name, shader) {
		this.map[name] = shader;
	}
}

export default new Shaders();
