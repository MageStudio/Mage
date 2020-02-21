import { ParticlesSystem, Randomizers, Emitter } from 'mage-engine.particles';
import {
    Vector3
} from 'three';
import SceneManager from '../../base/SceneManager';

export default class Fountain {

    constructor(options = {}) {

        const { container = SceneManager.scene } = options;

        this.system = new ParticlesSystem({
            container,
            particles: {
                globalSize: 5,
                ttl: 10,
                velocity: new Randomizers.SphereRandomizer(12.5),
                velocityBonus: new Vector3(0, 25, 0),
                gravity: -10,
                startColor: new Randomizers.ColorsRandomizer(),
                endColor: new Randomizers.ColorsRandomizer(),
            },
            system: {
                particlesCount: 1000,
                emitters: new Emitter({
                    onInterval: new Randomizers.MinMaxRandomizer(0, 5),
                    interval: new Randomizers.MinMaxRandomizer(0, 0.25),
                }),
                speed: 1,
            }
        });
    }

    update() {
        this.system.update();
    }
}
