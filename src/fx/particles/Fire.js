import { Color, Vector3 } from 'three';
import { Randomizers, Emitter, ParticlesSystem } from 'mage-engine.particles';

import Scene from '../../core/Scene';
import ParticleEmitter from './ParticleEmitter';

const getSparksOptions = options => {
    const { size = 0.3, velocity = 15, particles = {}, system = {} } = options;

    return {
        particles: {
            globalSize: size,
            ttl: 0.4,
            velocity: new Randomizers.SphereRandomizer(velocity),
            velocityBonus: new Vector3(0, 20, 0),
            startAlpha: 1,
            endAlpha: 0,
            color: new Randomizers.ColorsRandomizer(new Color(0.5, 0.2, 0), new Color(1, 0.5, 0)),
            startAlphaChangeAt: .2,
            blending: "blend",
            onSpawn: (particle) => {
                particle.position.y = 5;
            },
            ...particles
        },
        system: {
            particlesCount: 5,
            emitters: new Emitter({
                onInterval: new Randomizers.MinMaxRandomizer(0, 5),
                interval: new Randomizers.MinMaxRandomizer(0, 0.25),
            }),
            speed: .5,
            ...system
        }
    };
}

const getFireOptions = options => {
    const { size = 1, velocity = 3, particles = {}, system = {} } = options;

    return {
        particles: {
            startAlpha: size,
            endAlpha: 0,
            startSize: 10,
            endSize: 20,
            ttl: 3,
            velocity: new Randomizers.SphereRandomizer(velocity),
            velocityBonus: new Vector3(0, 5, 0),
            colorize: true,
            startColor: new Randomizers.ColorsRandomizer(new Color(0.5, 0.2, 0), new Color(1, 0.5, 0)),
            endColor: new Color(0, 0, 0),
            blending: "additive",
            worldPosition: true,
            ...particles
        },
        system: {
            particlesCount: 2000,
            emitters: new Emitter({
                onInterval: new Randomizers.MinMaxRandomizer(0, 0.3),
                interval: new Randomizers.MinMaxRandomizer(0, 0.1),
            }),
            depthWrite: false,
            speed: 0.8,
            ...system
        }
    };
}

export default class Fire extends ParticleEmitter {

    constructor(options = {}) {
        const {
            container = Scene.getScene(),
            autostart = false,
            sparks = { particles: {}, system: {} },
            fire = { particles: {}, system: {} }
        } = options;

        const parsedOptions = {
            sparks: {
                container,
                autostart,
                ...getSparksOptions(sparks)
            },
            fire: {
                container,
                autostart,
                ...getFireOptions(fire)
            }
        };

        super(parsedOptions);
    }

    hasSystem() {
        return !!this.system && !!this.sparks;
    }

    isSystemDead() {
        return this.system.finished && this.sparks.finished;
    }

    setSystem() {
        const {
            sparks = {},
            fire = {}
        } = this.options;

        this.system = new ParticlesSystem(fire);
        this.sparks = new ParticlesSystem(sparks);
    }

    setPosition(where) {
        const position = {
			...this.getPosition(),
			...where
        };

        this.system.particleSystem.position.set(position.x, position.y, position.z);
        this.sparks.particleSystem.position.set(position.x, position.y, position.z);
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
        }
    }

    update() {
        if (this.hasSystem()) {
            this.system.update();
            this.sparks.update();
        }
    }
}