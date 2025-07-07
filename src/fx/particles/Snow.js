import { Vector3, Color } from "three";
import { Randomizers, Emitter } from "mage-engine.particles";

import ParticleEmitter from "./ParticleEmitter";
import { ENTITY_TYPES } from "../../entities/constants";

export default class Snow extends ParticleEmitter {
    constructor({ container, autostart, particles, system }) {
        const options = {
            container,
            autostart,
            particles: {
                globalSize: 0.7,
                ttl: 5,
                velocity: new Randomizers.SphereRandomizer(30),
                velocityBonus: new Vector3(0, -30, 0),
                gravity: -10,
                startAlpha: 0.8,
                endAlpha: 0,
                startColor: new Color(1, 1, 1),
                endColor: new Color(0, 0, 0),
                startAlphaChangeAt: 0,
                blending: "blend",
                onSpawn: particle => {
                    particle.position.x = Math.random() * 200;
                    particle.position.z = Math.random() * 200;
                },
                ...particles,
            },
            system: {
                particlesCount: 4000,
                emitters: new Emitter({
                    onInterval: new Randomizers.MinMaxRandomizer(0, 5),
                    interval: new Randomizers.MinMaxRandomizer(0, 0.25),
                }),
                speed: 1.5,
                ...system,
            },
        };

        super(options);
        this.setEntitySubtype(ENTITY_TYPES.PARTICLE.SUBTYPES.SNOW);
    }
}
