import Proton from 'three.proton.js';
import { SpriteMaterial, Sprite, NormalBlending } from 'three';
import ParticleEmitter from './ParticleEmitter';
import Images from '../../images/Images';

const getDefaultInitializers = () => ([
    new Proton.Mass(0.1),
    new Proton.Radius(1),
    new Proton.Life(.4, 1),
    new Proton.Position(new Proton.SphereZone(1)),
    new Proton.V(new Proton.Span(3, 5), new Proton.Vector3D(0, .4, 0), 50),
    new Proton.V(new Proton.Polar3D(2, 1, 1), 300),
]);

const getDefaultBehaviours = () => ([
    new Proton.RandomDrift(.1, .1, .1, .05),
    new Proton.Rotate("random", "random"),
    new Proton.Scale(1, 0.1)
]);

const DEFAULT_PARTICLE_COLOR = 0xff0000;

export default class Explosion extends ParticleEmitter {

    constructor(options = {}) {
        const {
            initializers = getDefaultInitializers(),
            behaviours = getDefaultBehaviours(),
            texture = false
        } = options;

        const parsedOptions = {
            initializers,
            behaviours,
            texture
        };

        super(parsedOptions);
    }

    isProtonEmitter() { return true; }
    isSystemDead() { return this.system.dead; }

    createBody(texture, color = DEFAULT_PARTICLE_COLOR) {
        const map = Images.get(texture);
        const material = new SpriteMaterial({
            map,
            color,
            blending: NormalBlending
        });
        return new Sprite(material);
    }

    setSystem() {
        const {
            initializers,
            behaviours,
            texture,
            color
        } = this.options;

        this.system = new Proton.Emitter();
        this.system.rate = new Proton.Rate(new Proton.Span(100, 300), new Proton.Span(.05, .07));

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
}