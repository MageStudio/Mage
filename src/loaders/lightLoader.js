import Loader from './Loader';
import Config from '../base/config';
import SunLight from '../lights/SunLight';
import AmbientLight from '../lights/AmbientLight';
import PointLight from '../lights/PointLight';

import { SUNLIGHT, POINTLIGHT, AMBIENTLIGHT } from '../lights/lightEngine';

export class LightLoader extends Loader {

    constructor() {
        super();
    }

    load(lights, { useHelper = false }) {
        console.log(lights);
        lights.forEach(this.createLight(useHelper));
    }

    createLight = (useHelper) => l => {
        let light;
        switch(l.type) {
            case SUNLIGHT:
                light = this.createSunlight(l);
                break;
            case POINTLIGHT:
                light = this.createPointlight(l);
                break;
            case AMBIENTLIGHT:
                light = this.createAmbientLight(l);
                break;
            default:
                break;
        }

        if (light && useHelper) {
            light.addHelper();
        }
    }

    createSunlight({ color, intensity, position, target, name }) {
        return new SunLight({
            color,
            intensity,
            position,
            target,
            name
        });
    }

    createAmbientLight({ color, intensity, position, name }) {
        return new AmbientLight({
            color,
            intensity,
            position,
            name
        });
    }

    createPointlight({ color, intensity, position, distance, name }) {
        return new PointLight({
            color,
            intensity,
            position,
            distance,
            name
        })
    }
}

export default new LightLoader();
