import { CascadeShadowMaps } from "./csm/CascadeShadowMaps";

export const POINTLIGHT = "pointlight";
export const AMBIENTLIGHT = "ambientlight";
export const SUNLIGHT = "sunlight";
export const SPOTLIGHT = "spotlight";
export const HEMISPHERELIGHT = "hemisphere";

export class Lights {
    constructor() {
        this.lights = [];
        this.csm = undefined;
    }

    getLights() {
        return this.lights;
    }

    isUsingCascadeShadowMaps() {
        return !!this.csm;
    }

    createCascadeShadowMaps(options = {}) {
        this.csm = new CascadeShadowMaps(options);

        return this.csm;
    }

    add(light) {
        this.lights.push(light);
    }

    update(dt) {
        if (this.isUsingCascadeShadowMaps()) {
            this.csm.update();
        }
    }

    toJSON(parseJSON = false) {
        return {
            lights: this.lights.map(l => l.toJSON(parseJSON)),
        };
    }
}

export default new Lights();
