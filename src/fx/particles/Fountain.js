import Proton from "three.proton";
import { Vector3 } from "three";
import ProtonParticleEmitter from "./ProtonParticleEmitter";
import PALETTES from "../../lib/palettes";
import { ENTITY_TYPES } from "../../entities/constants";

const getFountainRate = () => new Proton.Rate(new Proton.Span(5, 10), new Proton.Span(0.05, 0.1));

const getFountainInitializers = (size, strength) => [
    new Proton.Mass(1),
    new Proton.Life(2, 4),
    new Proton.Radius(size / 2, size),
    new Proton.Position(new Proton.SphereZone(size / 2)),
    new Proton.V(new Proton.Span(strength, strength * 1.5), new Proton.Vector3D(0, 1, 0), 30),
];

const getFountainBehaviours = (gravity, colors) => [
    new Proton.Alpha(1, 0, Infinity, Proton.easeOutSine),
    new Proton.Scale(new Proton.Span(1, 1.5), 0.1),
    new Proton.G(gravity),
    new Proton.Color(colors[0], colors[1], Infinity, Proton.easeLinear),
    new Proton.RandomDrift(1, 0, 1, 0.5),
];

export default class Fountain extends ProtonParticleEmitter {
    constructor(options = {}) {
        const {
            texture,
            size = 5,
            strength = 25,
            gravity = 3,
            colors = [PALETTES.FRENCH.FLAT_FLESH, PALETTES.FRENCH.MELON_MELODY],
            autoEmit = false,
            emitWhenEditing = false,
            ...rest
        } = options;

        const fountainOptions = {
            rate: getFountainRate(),
            texture,
            initializers: getFountainInitializers(size, strength),
            behaviours: getFountainBehaviours(gravity, colors),
            autoEmit,
            emitWhenEditing,
            ...rest,
        };

        super(fountainOptions);
        this.setPreset("fountain");
        this.setEntitySubtype(ENTITY_TYPES.PARTICLE.SUBTYPES.FOUNTAIN);
        this.setParticleConfig({
            texture,
            size,
            strength,
            gravity,
            colors,
            autoEmit,
            emitWhenEditing,
        });
    }

    rebuild() {
        const config = this.getParticleConfig();
        const {
            texture,
            size = 5,
            strength = 25,
            gravity = 3,
            colors = [PALETTES.FRENCH.FLAT_FLESH, PALETTES.FRENCH.MELON_MELODY],
        } = config;

        this.rebuildSystem({
            rate: getFountainRate(),
            initializers: getFountainInitializers(size, strength),
            behaviours: getFountainBehaviours(gravity, colors),
            texture,
        });
    }

    setSize(size) {
        this.particleConfig.size = size;
        this.rebuild();
    }

    getSize() {
        return this.particleConfig.size;
    }

    setStrength(strength) {
        this.particleConfig.strength = strength;
        this.rebuild();
    }

    getStrength() {
        return this.particleConfig.strength;
    }

    setGravity(gravity) {
        this.particleConfig.gravity = gravity;
        this.rebuild();
    }

    getGravity() {
        return this.particleConfig.gravity;
    }

    setColors(colors) {
        this.particleConfig.colors = colors;
        this.rebuild();
    }

    getColors() {
        return this.particleConfig.colors;
    }
}
