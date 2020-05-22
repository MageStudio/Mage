import { EventDispatcher } from "three";
import { ParticlesSystem } from 'mage-engine.particles';
import Scene from '../../base/Scene';

export default class ParticleEmitter extends EventDispatcher {

    constructor(options = {}) {
        super();

        this.system = null;
        this.options = options;

        this.setSystem();
    }

    hasSystem() {
        return !!this.system;
    }

    setSystem() {
        const {
            container = Scene.getScene(),
            autostart = false,
            particles = {},
            system = {}
        } = this.options;

        this.system = new ParticlesSystem({
            container,
            autostart,
            particles,
            system
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