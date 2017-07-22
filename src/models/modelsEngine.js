window.M = window.M || {};

M.modelsEngine = {

	loader: new THREE.JSONLoader(),
	numModels : 0,
	modelsLoaded : 0,
	load : function() {

		M.modelsEngine.map = new HashMap();
		M.modelsEngine.models = [];

		for (var model in Assets.Models) {
			M.modelsEngine.numModels++;
			M.modelsEngine.loadSingleFile(model, Assets.Models[model]);
		}

		if (M.modelsEngine.numModels == 0) {
			M.assetsManager.completed.models = true;
		}
	},

	get : function(id) {
		return M.modelsEngine.map.get(id) || false;
	},

	loadSingleFile : function(id, path) {
		// Load a sound file using an ArrayBuffer XMLHttpRequest.
		M.modelsEngine.loader.load(path, function(geometry, materials) {
            var faceMaterial;
            if (materials && materials.length > 0) {
                var material = materials[0];
                material.morphTargets = true;
                faceMaterial = new THREE.MultiMaterial(materials);
            } else {
                faceMaterial = new THREE.MeshLambertMaterial({wireframe: true});
            }

            var model = {
				geometry: geometry,
				material: faceMaterial
			}

			M.modelsEngine.map.put(id, model);
			M.modelsEngine.modelsLoaded++;
			M.modelsEngine.checkLoad();
        });
	},

	checkLoad: function() {
		if (M.modelsEngine.modelsLoaded == M.modelsEngine.numModels) {
			M.assetsManager.completed.models = true;
		}
	},

	add: function(model) {
		M.modelsEngine.models.push(model);
	}
};