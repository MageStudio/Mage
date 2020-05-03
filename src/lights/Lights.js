import Scene from '../base/Scene';

export const POINTLIGHT = 'pointlight';
export const AMBIENTLIGHT = 'ambientlight';
export const SUNLIGHT = 'sunlight';

export class Lights {

    constructor() {
        this.delayFactor = 0.1;
        this.delayStep = 30;
        this.holderRadius = 0.01;
        this.holderSegments = 1;
        this.numLights = 0;

        this.map = {};
        this.lights = [];
    }

    add(light) {
        this.lights.push(light);
    }

    update(dt) {
        var start = new Date();
        for (var index in this.lights) {
            var light = this.lights[index];
            light.update(dt);
            if ((+new Date() - start) > 50) return;
        }
    }

    toJSON() {
        return {
            lights: this.lights.map(l => l.toJSON())
        };
    }
}

export default new Lights();
