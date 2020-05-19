import { EventDispatcher } from "three";
import Scene from '../../base/Scene';

export default class ParticleEmitter extends EventDispatcher {

    constructor(options) {
        super();

        this.system = null;
        this.options = options;
    }

    hasSystem() {
        return !!this.system;
    }

    setSystem() {
        const {
            container = Scene.getScene(),
            autostart = false,
            particles = {}
        } = this.options;

        const {
            ttl = 10,
            globalSize = 5,
            velocity = new Randomizers.SphereRandomizer(12.5),
            velocityBonus = new Vector3(0, 25, 0),
            particlesCount = 1000,
            blending = 'blend',
            gravity = -10,
            startAlpha = 1,
            endAlpha = 0,
            startColor = new Randomizers.ColorsRandomizer(),
            endColor = new Randomizers.ColorsRandomizer(),
            startAlphaChangeAt = 0,
            ...rest
        } = particles;

        this.system = new ParticlesSystem({
            container,
            autostart,
            particles: {
                ttl,
                globalSize,
                velocity,
                velocityBonus,
                blending,
                gravity,
                startAlpha,
                endAlpha,
                startColor,
                endColor,
                startAlphaChangeAt,
                onUpdate: (particle) => {
                    let floorY = -10;
                    if (particle.position.y < floorY) {
                        particle.position.y = floorY;
                        particle.velocity.y *= -0.5;
                        particle.velocity.x *= 0.5;
                        particle.velocity.z *= 0.5;
                    }
                },
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

    start() {
        if (this.hasSystem()) {
            this.system.start();
        }
    }

    update() {
        if (this.hasSystem()) {
            this.system.update();
        }
    }
}