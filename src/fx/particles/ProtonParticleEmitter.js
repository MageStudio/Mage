import Proton from 'three.proton.js';
import {
    SpriteMaterial,
    Sprite,
    AdditiveBlending,
    Euler
} from 'three';
import ParticleEmitter from './ParticleEmitter';
import Images from '../../images/Images';
import PALETTES from '../../lib/palettes';
import { Vector3 } from 'three';
import { Quaternion } from 'three';

const DEFAULT_PARTICLE_COLOR = PALETTES.BASE.BLACK;

export default class ProtonParticleEmitter extends ParticleEmitter {

    constructor(options = {}) {
        const {
            initializers = [],
            behaviours = [],
            texture = false,
            color = DEFAULT_PARTICLE_COLOR,
            rate
        } = options;

        const parsedOptions = {
            initializers,
            behaviours,
            texture,
            color,
            rate
        };

        super(parsedOptions);
    }

    isProtonEmitter() { return true; }
    isSystemDead() { return this.system.dead; }

    createParticleBody(texture, color) {
        return new Sprite(new SpriteMaterial({
            map: Images.get(texture),
            transparent: true,
            color,
            blending: AdditiveBlending,
            depthWrite: false,
            fog: true
        }));
    }

    setSystem() {
        const {
            initializers = [],
            behaviours = [],
            texture,
            color,
            rate
        } = this.options;

        this.system = new Proton.Emitter();
        this.system.rate = rate;

        initializers.forEach(initializer => this.system.addInitialize(initializer));

        if (texture) {
            this.system.addInitialize(new Proton.Body(this.createParticleBody(texture, color)));
        }

        behaviours.forEach(behaviour => this.system.addBehaviour(behaviour));
    }

    emit(duration = 'once', life) {
        if (this.hasSystem()) {
            this.system.emit(duration, life);
        }

        return this;
    }

    stop() {
        if (this.hasSystem()) {
            this.system.stopEmit();
        }
    }

    syncParticleEmitter() {
        const { position, rotation } = this.getWorldTransform();

        this.system.rotation.x = rotation.x;
        this.system.rotation.y = rotation.y;
        this.system.rotation.z = rotation.z;

        this.system.p.x = position.x;
        this.system.p.y = position.y;
        this.system.p.z = position.z;
    }

    dispose() {
        super.dispose();

        this.system.stopEmit();
        this.system.destroy();
    }
}