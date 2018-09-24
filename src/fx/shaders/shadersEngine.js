export default class ShadersEngine {

	constructor(assetsManager) {
		this.SHADERS_DIR = "app/shaders/";
		this.SHADERS = [];

		this.map = {};
		this.shaders = [];

		this.numShaders = 0;
		this.shadersLoaded = 0;
	}

	update() {}

	load() {
		if (Assets.Shaders) {
			for (var shader in Assets.Shaders) {
				this.numShaders++;
				this.loadSingleFile(shader, Assets.Shaders[shader]);
			}
		}

		if (this.numShaders == 0) {
			this.assetsManager.completed.shaders = true;
		}
	}

	get(id) {
		return this.map[id] || false;
	}

	loadSingleFile(id, path) {
		const type = path.split(".")[1];

		if ( type == "js" ) {
			include(path.split(".js")[0], this.checkLoad);
		} else {
			const request = new XMLHttpRequest();
			request.open("GET", path, true);
			request.responseType = "text";
			request.onload = (e) => {
				const shader = this.parseShader(request.responseText);
				this.map[id] = shader;
				this.shadersLoaded++;
				this.checkLoad();
			};
			request.send();
		}
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

	checkLoad() {
		if (this.shadersLoaded == this.numShaders) {
			this.assetsManager.completed.shaders = true;
		}
	}

	add(shader) {
		this.shaders.push(shader);
	}
}
