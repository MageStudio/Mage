import MTLLoader from "./MTLLoader";
import OBJLoader from "./OBJLoader";
import RequirementsTracer, { MODELS_REQUIREMENTS } from "./RequirementsTracer";

const EXTENSIONS = {
    OBJ: ".obj",
    MTL: ".mtl",
};

export const buildOBJMTLLoader = () => {
    const tracer = new RequirementsTracer();

    class OBJMTLLoader {
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

            return new Promise((resolve, reject) => {
                this.materialLoader.load(
                    materialPath,
                    material => {
                        material.preload();
                        resolve(material);
                    },
                    () => {},
                    () => {
                        tracer.trace(MODELS_REQUIREMENTS.MATERIAL);
                        reject();
                    },
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

    return { tracer, loader: new OBJMTLLoader() };
};
