import { Scene } from "../core/Scene";
import { CascadeShadowMaps } from "./csm/CascadeShadowMaps";

export const POINTLIGHT = 'pointlight';
export const AMBIENTLIGHT = 'ambientlight';
export const SUNLIGHT = 'sunlight';
export const SPOTLIGHT = 'spotlight';
export const HEMISPHERELIGHT = 'hemisphere';

const TIME_TO_UPDATE = 5;

export class Lights {

    constructor() {
        this.delayFactor = 0.1;
        this.delayStep = 30;
        this.holderRadius = 0.01;
        this.holderSegments = 1;
        this.numLights = 0;

        this.map = {};
        this.lights = [];
        this.csm = undefined;
    }

    isUsingCSM() {
        return !!this.csm;
    }

    setUpCSM(options = {}) {
        this.csm = new CascadeShadowMaps(options);
    }

    add(light) {
        this.lights.push(light);
    }

    update(dt) {
        if (this.isUsingCSM()) {
            this.csm.update();
        }

        const start = new Date();
        for (let index in this.lights) {
            const light = this.lights[index];
            light.update(dt);
            if ((+new Date() - start) > TIME_TO_UPDATE) break;
        }
    }

    toJSON() {
        return {
            lights: this.lights.map(l => l.toJSON())
        };
    }
}

export default new Lights();
