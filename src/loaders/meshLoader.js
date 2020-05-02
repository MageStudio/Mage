import Mesh from '../entities/Mesh';
import ShaderMesh from '../entities/ShaderMesh';
import Images from '../images/Images'
import Loader from './Loader';
import Scripts from '../scripts/Scripts';
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
            meshes.map(({mesh, scripts, texture, ...opts }) => (
                this.loadMesh(this.parseMesh(mesh), scripts, texture, opts)
            ));
        } catch(e) {
            console.log(e);
        }
    }

    parseMesh(mesh) {
        return this.loader.parse(mesh);
    }

    loadMesh(parsedMesh, scripts, texture, meshOptions) {
        const { scriptEnabled = true } = this.options;
        const mesh = new Mesh(parsedMesh.geometry, parsedMesh.material, meshOptions);

        mesh.position({ ...parsedMesh.position });
        mesh.rotation({ ...parsedMesh.rotation });
        mesh.scale({ ...parsedMesh.scale });

        if (scripts && scripts.length) {
            mesh.setScripts(scripts, scriptEnabled);
        }

        return mesh;
    }
}

export default new MeshLoader();
