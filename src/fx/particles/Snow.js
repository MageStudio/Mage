import Proton from "three.proton";
import { Vector3 } from "three";
import ProtonParticleEmitter from "./ProtonParticleEmitter";
import PALETTES from "../../lib/palettes";
import { ENTITY_TYPES } from "../../entities/constants";

const getSnowRate = (particleCount) =>
    new Proton.Rate(new Proton.Span(particleCount / 10, particleCount / 5), new Proton.Span(0.02, 0.05));

const getSnowInitializers = (size, strength, area) => [
    new Proton.Mass(0.3),
    new Proton.Life(3, 6),
    new Proton.Radius(size / 2, size),
    new Proton.Position(new Proton.BoxZone(area, 0, area)),
    new Proton.V(
        new Proton.Span(strength / 2, strength),
        new Proton.Vector3D(0, -1, 0),
        15,
    ),
];

const getSnowBehaviours = (drift, colors) => [
    new Proton.Alpha(0.8, 0),
    new Proton.Scale(new Proton.Span(0.5, 1), 0.2),
    new Proton.G(0.5),
    new Proton.Color(colors[0], colors[1], Infinity, Proton.easeLinear),
    new Proton.RandomDrift(drift, drift / 4, drift, 0.5),
];

export default class Snow extends ProtonParticleEmitter {
    constructor(options = {}) {
        const {
            texture,
            size = 2,
            strength = 30,
            area = 200,
            drift = 3,
            particleCount = 400,
            colors = [PALETTES.BASE.WHITE, PALETTES.BASE.WHITE],
            autoEmit = false,
            emitWhenEditing = false,
            ...rest
        } = options;

        const snowOptions = {
            rate: getSnowRate(particleCount),
            texture,
            initializers: getSnowInitializers(size, strength, area),
            behaviours: getSnowBehaviours(drift, colors),
            autoEmit,
            emitWhenEditing,
            ...rest,
        };

        super(snowOptions);
        this.setPreset("snow");
        this.setEntitySubtype(ENTITY_TYPES.PARTICLE.SUBTYPES.SNOW);
        this.setParticleConfig({ texture, size, strength, area, drift, particleCount, colors, autoEmit, emitWhenEditing });
    }

    rebuild() {
        const config = this.getParticleConfig();
        const { texture, size = 2, strength = 30, area = 200, drift = 3, particleCount = 400, colors = [PALETTES.BASE.WHITE, PALETTES.BASE.WHITE] } = config;

        this.rebuildSystem({
            rate: getSnowRate(particleCount),
            initializers: getSnowInitializers(size, strength, area),
            behaviours: getSnowBehaviours(drift, colors),
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

    setArea(area) {
        this.particleConfig.area = area;
        this.rebuild();
    }

    getArea() {
        return this.particleConfig.area;
    }

    setDrift(drift) {
        this.particleConfig.drift = drift;
        this.rebuild();
    }

    getDrift() {
        return this.particleConfig.drift;
    }

    setParticleCount(particleCount) {
        this.particleConfig.particleCount = particleCount;
        this.rebuild();
    }

    getParticleCount() {
        return this.particleConfig.particleCount;
    }

    setColors(colors) {
        this.particleConfig.colors = colors;
        this.rebuild();
    }

    getColors() {
        return this.particleConfig.colors;
    }
}
