import { Color, Vector3 } from 'three';
import { Randomizers, Emitter, ParticlesSystem } from 'mage-engine.particles';

import Scene from '../../core/Scene';
import ParticleEmitter from './ParticleEmitter';

const getSparksOptions = (options = {}) => {
    const { particles = {}, system = {}, size = 1, speed = 5 } = options;

    return {
        particles: {
            globalSize: size,
            ttl: 1.5,
            velocity: new Randomizers.SphereRandomizer(speed),
            offset: new Vector3(0, 1, 0),
            startAlpha: 1,
            endAlpha: 0,
            color: new Randomizers.ColorsRandomizer(new Color(0.5, 0.2, 0), new Color(1, 0.5, 0)),
            startAlphaChangeAt: 1,
            blending: "blend",
            ...particles
        },
        system: {
            particlesCount: 5,
            emitters: new Emitter({
                onInterval: new Randomizers.MinMaxRandomizer(10, 50),
                interval: 2,
            }),
            speed: 1.3,
            ttl: 1.5,
            ...system
        }
    }
};

const getExplosionOptions = (options = {}) => {
    const { particles = {}, system = {}, size = 1 }= options;

    return {
        particles: {
            globalSize: size,
            startAlpha: 1,
            endAlpha: 0,
            startAlphaChangeAt: .3,
            startSize: 1,
            endSize: 2,
            ttl: 1.5,
            gravity: -5,
            velocity: new Randomizers.SphereRandomizer(8),
            startColor: new Randomizers.ColorsRandomizer(),
            endColor: new Color(0, 0, 0),
            blending: "additive",
            ...particles
        },
        system: {
            particlesCount: 20,
            depthWrite: true,
            emitters: new Emitter({
                onInterval: new Randomizers.MinMaxRandomizer(100, 500),
                interval: 2,
            }),
            speed: 1.3,
            ttl: 1.5,
            ...system
        }
    }
};

const getDebrisOptions = (options = {}) => {
    const { particles = {}, system = {}, size = 1 } = options;
    
    return {
        particles: {
            globalSize: size,
            ttl: 1.5,
            velocity: new Randomizers.SphereRandomizer(8),
            gravity: -5,
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
            },
            ...particles
        },
        system: {
            particlesCount: 20,
            emitters: new Emitter({
                onInterval: new Randomizers.MinMaxRandomizer(250, 500),
                interval: 2,
            }),
            speed: 1.3,
            ttl: 1.5,
            ...system
        }
    }
}

export default class Explosion extends ParticleEmitter {

    constructor(options = {}) {
        const {
            container = Scene.getScene(),
            autostart = false,
            sparks = { particles: {}, system: {} },
            explosion = { particles: {}, system: {} },
            debris = { particles: {}, system: {} }
        } = options;

        const parsedOptions = {
            autostart,
            sparks: {
                container,
                autostart,
                ...getSparksOptions(sparks)
            },
            explosion: {
                container,
                autostart,
                ...getExplosionOptions(explosion)
            },
            debris: {
                container,
                autostart,
                ...getDebrisOptions(debris)
            }
        };

        super(parsedOptions);
    }

    hasSystem() {
        return !!this.system && !!this.sparks && !!this.debris;
    }

    isSystemDead() {
        return this.system.finished && this.sparks.finished && this.debris.finished;
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

        return this;
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

        return this;
    }

    getRotation() {
        return {
            x: this.system.particleSystem.rotation.x,
            y: this.system.particleSystem.rotation.y,
            z: this.system.particleSystem.rotation.z
        };
    }

    start() {
        console.log('starting');
        if (this.hasSystem()) {
            Promise.all([
                this.system.start(),
                this.sparks.start(),
                this.debris.start()
            ]);
        }

        return this;
    }

    dispose = () => {
        if (this.hasSystem()) {
            this.system.removeAndDisposeIfFinished();
            this.sparks.removeAndDisposeIfFinished();
            this.debris.removeAndDisposeIfFinished();
        }
    }

    update(dt) {
        if (this.hasSystem()) {
            Promise.all([
                this.system.update(dt),
                this.sparks.update(dt),
                this.debris.update(dt),
            ]);
        }
    }
}