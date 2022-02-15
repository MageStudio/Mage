import Proton from 'three.proton.js';
import {
    SpriteMaterial,
    Sprite,
    AdditiveBlending,
    NotEqualDepth,
    GreaterDepth,
    LessEqualDepth,
    LessDepth,
    EqualDepth,
    NeverDepth
} from 'three';
import ParticleEmitter from './ParticleEmitter';
import Images from '../../images/Images';
import PALETTES from '../../lib/palettes';

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

    createBody(texture, color) {
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
            this.system.addInitialize(new Proton.Body(this.createBody(texture, color)));
        }

        behaviours.forEach(behaviour => this.system.addBehaviour(behaviour));
    }

    setPosition(where = {}) {
        const position = {
            ...this.getPosition(),
            ...where
        };

        this.system.p.x = position.x;
        this.system.p.y = position.y;
        this.system.p.z = position.z;

        return this;
    }

    getPosition() {
        return {
            x: this.system.p.x,
            y: this.system.p.y,
            z: this.system.p.z
        };
    }

    setRotation(howmuch) {
        const rotation = {
            ...this.getRotation(),
            ...howmuch
        };

        this.system.rotation.x = rotation.x;
        this.system.rotation.y = rotation.y;
        this.system.rotation.z = rotation.z;

        return this;
    }

    getRotation() {
        return {
            x: this.system.rotation.x,
            y: this.system.rotation.y,
            z: this.system.rotation.z
        };
    }

    start(duration = 'once', life) {
        if (this.hasSystem()) {
            this.system.emit(duration, life);
        }

        return this;
    }

    dispose() {
        this.system.stopEmit();
        this.system.destroy();
    }
}