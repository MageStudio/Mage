import { Vector3 } from 'three';
import { Randomizers, Emitter } from 'mage-engine.particles';

import ParticleEmitter from './ParticleEmitter';

export default class Fountain extends ParticleEmitter {

    constructor({ container, autostart, particles, system }) {
        const options = {
            container,
            autostart,
            particles: {
                ttl: 10,
                globalSize: 5,
                velocity: new Randomizers.SphereRandomizer(12.5),
                velocityBonus: new Vector3(0, 25, 0),
                particlesCount: 1000,
                blending: 'blend',
                gravity: -10,
                startAlpha: 1,
                endAlpha: 0,
                startColor: new Randomizers.ColorsRandomizer(),
                endColor: new Randomizers.ColorsRandomizer(),
                startAlphaChangeAt: 0,
                onUpdate: (particle) => {
                    let floorY = -10;
                    if (particle.position.y < floorY) {
                        particle.position.y = floorY;
                        particle.velocity.y *= -0.5;
                        particle.velocity.x *= 0.5;
                        particle.velocity.z *= 0.5;
                    }
                },
                ...particles
            },
            system: {
                particlesCount: 100,
                emitters: new Emitter({
                    onInterval: new Randomizers.MinMaxRandomizer(0, 5),
                    interval: new Randomizers.MinMaxRandomizer(0, 0.25),
                }),
                speed: 1,
                ...system
            }
        };

        super(options);
    }
}
