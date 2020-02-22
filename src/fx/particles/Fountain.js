import { ParticlesSystem, Randomizers, Emitter } from 'mage-engine.particles';
import {
    Vector3
} from 'three';
import SceneManager from '../../base/SceneManager';

export default class Fountain {

    constructor(options = {}) {

        const {
            container = SceneManager.scene,
            particles = {}
        } = options;

        const {
            ttl = 10,
            globalSize = 5,
            gravity = -10,
            velocity = new Randomizers.SphereRandomizer(12.5),
            velocityBonus = new Vector3(0, 25, 0),
            particlesCount = 1000,
            ...rest
        } = particles;

        this.system = new ParticlesSystem({
            container,
            particles: {
                globalSize,
                ttl,
                velocity,
                velocityBonus,
                gravity,
                ...rest
            },
            system: {
                particlesCount,
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
