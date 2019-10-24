import Mesh from '../entities/Mesh';
import ShaderMesh from '../entities/ShaderMesh';
import ImagesEngine from '../images/ImagesEngine'
import Loader from './Loader';
import ScriptManager from '../scripts/ScriptManager';
import {
    RepeatWrapping
} from 'three';

export class MeshLoader extends Loader {

    constructor() {
        super();
    }

    load(meshes = [], options = {}) {
        this.options = options;
        try {
            meshes
                .map(({mesh, script, texture}) => this.loadMesh(this.parseMesh(mesh), script, texture))
                .map(MeshLoader.executeStartScript);
        } catch(e) {
            console.log(e);
        }
    }

    parseMesh(mesh) {
        return this.loader.parse(mesh);
    }

    loadMesh(parsedMesh, script, texture) {

        const { scriptEnabled = true } = this.options;
        const mesh = new Mesh(parsedMesh.geometry, parsedMesh.material);

        mesh.position({ ...parsedMesh.position });
        mesh.rotation({ ...parsedMesh.rotation });
        mesh.scale({ ...parsedMesh.scale });

        if (script && script.name) {
            mesh.addScript(script.name, scriptEnabled);
        }

        return mesh;
    }

    static executeStartScript(element) {
        element.start.call(element);
        return element;
    }
}

export default new MeshLoader();
