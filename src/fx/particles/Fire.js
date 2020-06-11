import { Color, Vector3 } from 'three';
import { Randomizers, Emitter, ParticlesSystem } from 'mage-engine.particles';

import Scene from '../../core/Scene';

const SPARKS_OPTIONS = {
    particles: {
        globalSize: 0.3,
        ttl: 0.4,
        velocity: new Randomizers.SphereRandomizer(15),
        velocityBonus: new Vector3(0, 20, 0),
        startAlpha: 1,
        endAlpha: 0,
        color: new Randomizers.ColorsRandomizer(new Color(0.5, 0.2, 0), new Color(1, 0.5, 0)),
        startAlphaChangeAt: .2,
        blending: "blend",
        onSpawn: (particle) => {
            particle.position.y = 5;
        }
    },
    system: {
        particlesCount: 5,
        emitters: new Emitter({
            onInterval: new Randomizers.MinMaxRandomizer(0, 5),
            interval: new Randomizers.MinMaxRandomizer(0, 0.25),
        }),
        speed: .5,
    }
};

const SYSTEM_OPTIONS = {
    particles: {
        startAlpha: 1,
        endAlpha: 0,
        startSize: 10,
        endSize: 20,
        ttl: 3,
        velocity: new Randomizers.SphereRandomizer(3),
        velocityBonus: new Vector3(0, 5, 0),
        colorize: true,
        startColor: new Randomizers.ColorsRandomizer(new Color(0.5, 0.2, 0), new Color(1, 0.5, 0)),
        endColor: new Color(0, 0, 0),
        blending: "additive",
        worldPosition: true,
    },
    system: {
        particlesCount: 2000,
        emitters: new Emitter({
            onInterval: new Randomizers.MinMaxRandomizer(0, 0.3),
            interval: new Randomizers.MinMaxRandomizer(0, 0.1),
        }),
        depthWrite: false,
        speed: 0.8
    }
};

export default class Fire {

    constructor(options = {}) {
        const {
            container = Scene.getScene(),
            autostart = false,
            sparks = { particles: {}, system: {} },
            fire = { particles: {}, system: {} }
        } = options;

        this.system = null;
        this.sparks = null;

        this.options = {
            sparks: {
                container,
                autostart,
                particles: {
                    ...SPARKS_OPTIONS.particles,
                    ...sparks.particles
                },
                system: {
                    ...SPARKS_OPTIONS.system,
                    ...sparks.system
                }
            },
            fire: {
                container,
                autostart,
                particles: {
                    ...SYSTEM_OPTIONS.particles,
                    ...fire.particles
                },
                system: {
                    ...SYSTEM_OPTIONS.system,
                    ...fire.system
                }
            }
        };

        this.setSystem();
    }

    hasSystem() {
        return !!this.system && !!this.sparks;
    }

    setSystem() {
        const {
            sparks = {},
            fire = {}
        } = this.options;

        this.system = new ParticlesSystem(fire);
        this.sparks = new ParticlesSystem(sparks);
    }

    start() {
        if (this.hasSystem()) {
            this.system.start();
            this.sparks.start();
        }
    }

    update() {
        if (this.hasSystem()) {
            this.system.update();
            this.sparks.update();
        }
    }
}