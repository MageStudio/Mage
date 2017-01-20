app.meshLoader = {
    load: function(meshes) {
        for (var i=0; i<meshes.length; i++) {
			var current = meshes[i],
                script = app.meshLoader._parseScript(current),
                parsedMesh = app.meshLoader._parseMesh(current);

			if (parsedMesh.name.indexOf('_camera') > -1) {
				app.meshLoader._loadCamera(parsedMesh, script);
			} else {
                app.meshLoader._loadMesh(parsedMesh, script);
			}
        }
    },

    _parseMesh(mesh) {
        return this.loader.parse(mesh);
    },

    _parseScript(mesh) {
        var script = mesh.object.userData ? mesh.object.userData['script'] : false,
            dir = false,
            file = false;
        if (script) {
            script = script.slice(script.lastIndexOf('scripts/') + 8);
            dir = script.slice(0, script.indexOf('/')),
            file = script.slice(script.indexOf('/') + 1);
        }

        return {
            script: script,
            dir: dir,
            file: file
        };
    },

    _loadCamera(mesh, script) {
        var camType = mesh.name.replace('_', '').toLowerCase();
        if (app.camera.object.type.toLowerCase() === camType) {
            app.camera.object.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
            app.camera.object.rotation.set(mesh.rotation.x, mesh.rotation.y, mesh.rotation.z);
            app.camera.object.scale.set(mesh.scale.x, mesh.scale.y, mesh.scale.z);

            app.meshLoader._attachScript(app.camera, script);
        }
    },

    _loadMesh(parsedMesh script) {
        parsedMesh.castShadow = true;
        parsedMesh.receiveShadow = true;
        var mesh = new Mesh(parsedMesh.geometry, parsedMesh.material);
        mesh.mesh.position.set(parsedMesh.position.x, parsedMesh.position.y, parsedMesh.position.z);
        mesh.mesh.rotation.set(parsedMesh.rotation.x, parsedMesh.rotation.y, parsedMesh.rotation.z);
        mesh.mesh.scale.set(parsedMesh.scale.x, parsedMesh.scale.y, parsedMesh.scale.z);
        mesh.mesh.castShadow = true;
        mesh.mesh.receiveShadow = true;
        // setting texture
        if (current.textureKey) {
            var texture = ImagesEngine.get(current.textureKey);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(1, 1);
            mesh.mesh.material.map = texture;
        }

        app.meshLoader._attachScript(mesh, script);
    },

    _attachScript(mesh, script) {
        if (script.dir && script.file) {
            mesh.addScript(script.file.replace('.js', ''), script.dir);
        }
    }
}
