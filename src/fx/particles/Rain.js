import Proton from "three.proton";
import ProtonParticleEmitter from "./ProtonParticleEmitter";
import { ENTITY_TYPES } from "../../entities/constants";

const getRainRate = particleCount =>
    new Proton.Rate(
        new Proton.Span(particleCount / 10, particleCount / 5),
        new Proton.Span(0.01, 0.02),
    );

const getRainInitializers = (size, strength, area) => [
    new Proton.Mass(0.5),
    new Proton.Life(2, 5),
    new Proton.Radius(size / 4, size / 2),
    new Proton.Position(new Proton.BoxZone(area, 0, area)),
    new Proton.V(new Proton.Span(strength, strength * 1.5), new Proton.Vector3D(0, -1, 0), 2),
];

const getRainBehaviours = (strength, colors) => [
    new Proton.Alpha(1, 0),
    new Proton.Scale(new Proton.Span(0.3, 0.5), 0.1),
    new Proton.G(strength / 10),
    new Proton.Color(colors[0], colors[1], Infinity, Proton.easeLinear),
    new Proton.RandomDrift(0.5, 0, 0.5, 0.5),
];

export default class Rain extends ProtonParticleEmitter {
    constructor(options = {}) {
        const {
            texture,
            size = 1,
            strength = 60,
            area = 100,
            particleCount = 200,
            colors = ["#ffffff", "#000000"],
            autoEmit = false,
            emitWhenEditing = false,
            ...rest
        } = options;

        const rainOptions = {
            rate: getRainRate(particleCount),
            texture,
            initializers: getRainInitializers(size, strength, area),
            behaviours: getRainBehaviours(strength, colors),
            autoEmit,
            emitWhenEditing,
            ...rest,
        };

        super(rainOptions);
        this.setPreset("rain");
        this.setEntitySubtype(ENTITY_TYPES.PARTICLE.SUBTYPES.RAIN);
        this.setParticleConfig({
            texture,
            size,
            strength,
            area,
            particleCount,
            colors,
            autoEmit,
            emitWhenEditing,
        });
    }

    rebuild() {
        const config = this.getParticleConfig();
        const {
            texture,
            size = 1,
            strength = 60,
            area = 100,
            particleCount = 200,
            colors = ["#ffffff", "#000000"],
        } = config;

        this.rebuildSystem({
            rate: getRainRate(particleCount),
            initializers: getRainInitializers(size, strength, area),
            behaviours: getRainBehaviours(strength, colors),
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
