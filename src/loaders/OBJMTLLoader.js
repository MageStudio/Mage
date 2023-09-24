import MTLLoader from "./MTLLoader";
import OBJLoader from "./OBJLoader";

const EXTENSIONS = {
    OBJ: ".obj",
    MTL: ".mtl",
};

export default class OBJMTLLoader {
    constructor(options) {
        this.options = options || {};
        this.materialLoader = new MTLLoader();
        this.objLoader = new OBJLoader();
    }

    setOptions(options) {
        this.options = options;
        this.materialLoader.setOptions(options);
    }

    tryLoadingMTL(path) {
        const { material } = this.options;
        const materialPath = material || path.replace(EXTENSIONS.OBJ, EXTENSIONS.MTL);

        return new Promise(resolve => {
            this.materialLoader.load(
                materialPath,
                material => {
                    material.preload();
                    resolve(material);
                },
                () => {},
                () => resolve(null),
            );
        });
    }

    loadObj(path, material) {
        if (material) {
            this.objLoader.setMaterials(material);
        }

        return new Promise(resolve => this.objLoader.load(path, resolve));
    }

    load(path, onComplete) {
        this.tryLoadingMTL(path)
            .then(material => this.loadObj(path, material))
            .then(onComplete);
    }
}
