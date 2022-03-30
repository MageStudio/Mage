import Element from '../entities/Element';
import Loader from './Loader';

export class MeshLoader extends Loader {

    constructor() {
        super();
    }

    load(elements = [], options = {}) {
        this.options = options;
        try {
            elements.map(({mesh, scripts, texture, ...opts }) => (
                this.loadMesh(this.parseMesh(mesh), scripts, texture, opts)
            ));
        } catch(e) {
            console.log(e);
        }
    }

    parseMesh(mesh) {
        return this.loader.parse(mesh);
    }

    loadMesh({ geometry, material, position, rotation, scale}, scripts, texture, elementOptions) {
        const { scriptEnabled = true } = this.options;
        const element = new Element({
            geometry,
            material,
            ...elementOptions
        });

        element.setPosition({ ...position });
        element.setRotation({ ...rotation });
        element.setScale({ ...scale });

        if (scripts && scripts.length) {
            element.addScripts(scripts.names, scripts.options, scriptEnabled);
            element.start();
        }

        return element;
    }
}

export default new MeshLoader();
