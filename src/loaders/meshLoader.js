import { Element } from '../entities';
import Loader from './Loader';

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
        const mesh = new Element(parsedMesh.geometry, parsedMesh.material, meshOptions);

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
