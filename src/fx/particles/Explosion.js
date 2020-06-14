import { Color, Vector3 } from 'three';
import { Randomizers, Emitter, ParticlesSystem } from 'mage-engine.particles';

import Scene from '../../core/Scene';

const SPARKS_OPTIONS = {
    particles: {
        globalSize: 1,
        ttl: 1.5,
        velocity: new Randomizers.SphereRandomizer(30),
        velocityBonus: new Vector3(10, 20, 10),
        startAlpha: 1,
        endAlpha: 0,
        color: new Randomizers.ColorsRandomizer(new Color(0.5, 0.2, 0), new Color(1, 0.5, 0)),
        startAlphaChangeAt: 1,
        blending: "blend",
        onSpawn: (particle) => {
            particle.position.y = 5;
        }
    },
    system: {
        particlesCount: 5,
        emitters: new Emitter({
            onInterval: new Randomizers.MinMaxRandomizer(0, 5),
            interval: 2,
        }),
        speed: 1.3,
        ttl: 1
    }
};

const SYSTEM_OPTIONS = {
    particles: {
        startAlpha: 1,
        endAlpha: 0,
        startAlphaChangeAt: .3,
        startSize: new Randomizers.MinMaxRandomizer(5, 8),
        endSize: new Randomizers.MinMaxRandomizer(8, 10),
        ttl: .7,
        gravity: -5,
        velocity: new Randomizers.SphereRandomizer(25, 5),
        velocityBonus: new Vector3(20, 20, 20),
        startColor: new Randomizers.ColorsRandomizer(new Color(0.5, 0.2, 0), new Color(1, 0.5, 0)),
        endColor: new Color(0, 0, 0),
        blending: "additive",
        worldPosition: true,
    },
    system: {
        particlesCount: 20,
        depthWrite: true,
        emitters: new Emitter({
            onInterval: new Randomizers.MinMaxRandomizer(250, 500),
            interval: 2,
        }),
        speed: 1.3,
        ttl: 1
    }
};

const DEBRIS_OPTIONS = {
    particles: {
        globalSize: 3,
        ttl: 2,
        velocity: new Randomizers.SphereRandomizer(30.5),
        velocityBonus: new Vector3(10, 15, 10),
        gravity: -30,
        startAlpha: 1,
        endAlpha: 0,
        startColor: new Randomizers.ColorsRandomizer(),
        endColor: new Randomizers.ColorsRandomizer(),
        startAlphaChangeAt: 0,
        blending: "blend",
        onUpdate: (particle) => {
            if (particle.position.y < 0) {
                particle.position.y = 0;
                particle.velocity.y = -0.5;
                particle.velocity.x = 0.5;
                particle.velocity.z *= 0.5;
            }
        }
    },
    system: {
        particlesCount: 20,
        emitters: new Emitter({
            onInterval: new Randomizers.MinMaxRandomizer(250, 500),
            interval: 2,
        }),
        speed: 1.3,
        ttl: 1
    }
}

export default class Explosion {

    constructor(options = {}) {
        const {
            container = Scene.getScene(),
            autostart = false,
            sparks = { particles: {}, system: {} },
            explosion = { particles: {}, system: {} },
            debris = { particles: {}, system: {} }
        } = options;

        this.system = null;
        this.sparks = null;
        this.debris = null;

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
            explosion: {
                container,
                autostart,
                particles: {
                    ...SYSTEM_OPTIONS.particles,
                    ...explosion.particles
                },
                system: {
                    ...SYSTEM_OPTIONS.system,
                    ...explosion.system
                }
            },
            debris: {
                container,
                autostart,
                particles: {
                    ...DEBRIS_OPTIONS.particles,
                    ...debris.particles
                },
                system: {
                    ...DEBRIS_OPTIONS.system,
                    ...debris.system
                }
            }
        };

        this.setSystem();
    }

    hasSystem() {
        return !!this.system && !!this.sparks && !!this.debris;
    }

    setSystem() {
        const {
            sparks = {},
            explosion = {},
            debris = {}
        } = this.options;

        this.system = new ParticlesSystem(explosion);
        this.sparks = new ParticlesSystem(sparks);
        this.debris = new ParticlesSystem(debris);
    }

    setPosition(where) {
        const position = {
			...this.getPosition(),
			...where
        };

        this.system.particleSystem.position.set(position.x, position.y, position.z);
        this.sparks.particleSystem.position.set(position.x, position.y, position.z);
        this.debris.particleSystem.position.set(position.x, position.y, position.z);
    }

    getPosition() {
        return {
            x: this.system.particleSystem.position.x,
            y: this.system.particleSystem.position.y,
            z: this.system.particleSystem.position.z
        };
    }

    setRotation(howmuch) {
        const rotation = {
			...this.getRotation(),
			...howmuch
        };

        this.system.particleSystem.rotation.set(rotation.x, rotation.y, rotation.z);
        this.sparks.particleSystem.rotation.set(rotation.x, rotation.y, rotation.z);
        this.debris.particleSystem.rotation.set(rotation.x, rotation.y, rotation.z);
    }

    getRotation() {
        return {
            x: this.system.particleSystem.rotation.x,
            y: this.system.particleSystem.rotation.y,
            z: this.system.particleSystem.rotation.z
        };
    }

    start() {
        if (this.hasSystem()) {
            this.system.start();
            this.sparks.start();
            this.debris.start();
        }
    }

    update() {
        if (this.hasSystem()) {
            this.system.update();
            this.sparks.update();
            this.debris.update();
        }
    }
}