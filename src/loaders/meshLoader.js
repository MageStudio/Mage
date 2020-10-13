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

    loadMesh(parsedMesh, scripts, texture, elementOptions) {
        const { scriptEnabled = true } = this.options;
        const element = new Element(parsedMesh.geometry, parsedMesh.material, elementOptions);

        element.setPosition({ ...parsedMesh.position });
        element.setRotation({ ...parsedMesh.rotation });
        element.setScale({ ...parsedMesh.scale });

        if (scripts && scripts.length) {
            element.addScripts(scripts.names, scripts.options, scriptEnabled);
            element.start();
        }

        return element;
    }
}

export default new MeshLoader();
