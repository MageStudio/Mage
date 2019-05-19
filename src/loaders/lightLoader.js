import Loader from './Loader';
import Config from '../base/config';
import SunLight from '../lights/SunLight';
import AmbientLight from '../lights/AmbientLight';

export class LightLoader extends Loader {

    constructor() {
        super();
    }

    load(lights) {
        for (var j=0; j<lights.length; j++) {
            var current = lights[j]
                parsedLight = this._parseLight(current);

            if (current.light.object.type == "SunLight") {
                this._loadDirectionalLight(parsedLight);
            } else if (current.light.object.type == "AmbientLight") {
                this._loadAmbientLight(parsedLight);
            } else if (current.light.object.type == "PointLight") {
                this._loadPointLight(parsedLight);
            }
        }
    }

    _parseLight(light) {
        return {
            holder: (light.holder) ? this.loader.parse(light.holder) : false,
            target: (light.target) ? this.loader.parse(light.target) : false,
            light: (light.light) ? this.loader.parse(light.light) : false
        };
    }

    _loadDirectionalLight(light) {
        new SunLight(
            light.light.color,
            light.light.intensity,
            light.light.distance,
            light.light.position,
            light.target
        );
    }

    _loadAmbientLight(light) {
        new AmbientLight(
            light.light.color,
            light.light.intensity,
            light.light.position
        );
    }

    _loadPointLight(light) {
        var d = 200;
        var position = light.holder ? light.holder.position : light.light.position;
        var pointlight = new PointLight(light.light.color, light.light.intensity, d, position);
        pointlight.light.castShadow = true;
        pointlight.light.shadow.camera.left = -d;
        pointlight.light.shadow.camera.right = d;
        pointlight.light.shadow.camera.top = d;
        pointlight.light.shadow.camera.bottom = -d;
        pointlight.light.shadow.camera.far = Config.camera().far;
        pointlight.light.shadow.darkness = 0.2;
    }
}

export default new LightLoader();
