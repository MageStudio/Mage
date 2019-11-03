import Light from './Light';
import LightEngine from './LightEngine';
import SceneManager from '../base/SceneManager';

import {
    SphereGeometry,
    MeshPhongMaterial,
    PointLight as THREEPointLight
} from 'three';

export default class LightPoint extends Light {

    constructor({ color, intensity, distance, position, name }) {

        super({ color, intensity, name });

        this.geometry = new SphereGeometry(
            LightEngine.holderRadius,
            LightEngine.holderSegment,
            LightEngine.holderSegment
        );
        this.material = new MeshPhongMaterial({color: this.color});
        this.mesh = new Mesh(this.geometry, this.material);
        this.light = new THREEPointLight(color, intensity, distance);

        this.mesh.mesh.add(this.light);

        SceneManager.add(this.light, this);

    }
}
