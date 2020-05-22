import { Randomizers, Emitter } from 'mage-engine.particles';
import { Color } from 'three';

import ParticleEmitter from './ParticleEmitter';

export default class Explosion extends ParticleEmitter {

    constructor({ container, autostart = false, particles = {}, system = {} }) {
        const options = {
            container,
            autostart,
            particles: {
                startAlpha: 1,
                endAlpha: 0,
                startSize: new Randomizers.MinMaxRandomizer(1, 5),
                endSize: new Randomizers.MinMaxRandomizer(50, 150),
                ttl: 2,
                velocity: new Randomizers.SphereRandomizer(55, 35),
                startColor: new Randomizers.ColorsRandomizer(new Color(0.5, 0.2, 0), new Color(1, 0.5, 0)),
                endColor: new Color(0, 0, 0.5),
                blending: "additive",
                worldPosition: true,
                rotation: new Randomizers.MinMaxRandomizer(0, 6.28319),
                rotationSpeed: new Randomizers.MinMaxRandomizer(-10, 10),
                ...particles
            },
            system: {
                particlesCount: 500,
                scale: 1,
                depthWrite: false,
                emitters: new Emitter({
                    onInterval: new Randomizers.MinMaxRandomizer(250, 500),
                    interval: 2,
                }),
                speed: 1,
                ...system
            }
        }

        super(options);
    }
};