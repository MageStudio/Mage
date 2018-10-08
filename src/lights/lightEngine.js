import SceneManager from '../base/SceneManager';

export class LightEngine {

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

    update() {
        var start = new Date();
        for (var index in this.lights) {
            var light = this.lights[index];
            light.update(SceneManager.clock.getDelta());
            if ((+new Date() - start) > 50) return;
        }
    }
}

export default new LightEngine();
