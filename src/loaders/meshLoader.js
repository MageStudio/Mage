import Mesh from '../entities/Mesh';
import ShaderMesh from '../entities/ShaderMesh';
import imagesEngine from '../images/imagesEngine'
import Loader from './Loader';

class MeshLoader extends Loader {

    load(meshes) {
        for (var i=0; i<meshes.length; i++) {
			var current = meshes[i],
                shader = this._parseShader(current),
                script = this._parseScript(current),
                parsedMesh = this._parseMesh(current);

			if (parsedMesh.name.indexOf('_camera') > -1) {
				this._loadCamera(parsedMesh, script);
			} else {
                this._loadMesh(current, parsedMesh, script, shader);
			}
        }
    }

    _parseMesh: function(mesh) {
        return app.loader.parse(mesh);
    }

    _parseScript: function(mesh) {
        var script = mesh.object.userData ? mesh.object.userData['script'] : false,
            dir = false,
            file = false;
        if (script) {
            script = script.slice(script.lastIndexOf('scripts/') + 8);
            dir = script.slice(0, script.indexOf('/'));
            file = script.slice(script.indexOf('/') + 1);
        }

        return {
            script: script,
            dir: dir,
            file: file
        };
    }

    _parseShader: function(mesh) {
        var name = mesh.object.userData ? mesh.object.userData['shader_name'] : false,
            options = mesh.object.userData ? JSON.parse(mesh.object.userData['shader_options']) : false;

        if (name) {
            var opts = {};
            for (var i in options) {
                Object.assign(opts, options[i]);
            }
        }

        return {
            name: name,
            options: opts
        };
    }

    _loadCamera: function(mesh, script) {
        var camType = mesh.name.replace('_', '').toLowerCase();
        if (app.camera.object.type.toLowerCase() === camType) {
            app.camera.object.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
            app.camera.object.rotation.set(mesh.rotation.x, mesh.rotation.y, mesh.rotation.z);
            app.camera.object.scale.set(mesh.scale.x, mesh.scale.y, mesh.scale.z);

            this._attachScript(app.camera, script);
        }
    },

    _loadMesh: function(current, parsedMesh, script, shader) {
        if (shader && shader.name && shader.options) {
            var mesh = new ShaderMesh({}, shader.name, {}, {}, shader.options);
        } else {
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
                var texture = imagesEngine.get(current.textureKey);
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(1, 1);
                mesh.mesh.material.map = texture;
            }
        }

        this._attachScript(mesh, script);
    },

    _attachScript: function(mesh, script) {
        if (script.dir && script.file) {
            mesh.addScript(script.file.replace('.js', ''), script.dir);
        }
    }
}

this = {




    // giro tenere senso derby collaboratore


}
