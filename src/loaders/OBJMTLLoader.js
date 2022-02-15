import MTLLoader from "./MTLLoader";
import OBJLoader from "./OBJLoader";

const EXTENSIONS = {
    OBJ: '.obj',
    MTL: '.mtl'
};

export default class OBJMTLLoader {

    constructor() {
        this.mtlLoader = new MTLLoader();
        this.objLoader = new OBJLoader();
    }

    tryLoadingMTL(path) {
        const mtlPath = path.replace(EXTENSIONS.OBJ, EXTENSIONS.MTL);

        return new Promise(resolve => {
            this.mtlLoader.load(mtlPath,
                material => {
                    material.preload();
                    resolve(material);
                },
                () => {},
                () => resolve(null)
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