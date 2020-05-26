import BaseMesh from '../entities/BaseMesh';
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
        const mesh = new BaseMesh(parsedMesh.geometry, parsedMesh.material, meshOptions);

        mesh.setPosition({ ...parsedMesh.position });
        mesh.setRotation({ ...parsedMesh.rotation });
        mesh.setScale({ ...parsedMesh.scale });

        if (scripts && scripts.length) {
            mesh.setScripts(scripts, scriptEnabled);
        }

        return mesh;
    }
}

export default new MeshLoader();
