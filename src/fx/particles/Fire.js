import Proton from "three.proton";
import { Vector3 } from "three";
import ProtonParticleEmitter from "./ProtonParticleEmitter";
import PALETTES from "../../lib/palettes";
import { ENTITY_TYPES } from "../../entities/constants";
const getFireRate = () => new Proton.Rate(new Proton.Span(10, 15), new Proton.Span(0.05, 0.1));

const getFireInitializers = (direction, strength, size) => [
    new Proton.Mass(1),
    new Proton.Life(1, 2),
    new Proton.Radius(size / 2, size / 1.5, "center"),
    new Proton.Position(new Proton.SphereZone(size)),
    new Proton.V(
        new Proton.Span(strength, strength * 2),
        new Proton.Vector3D(direction.x, direction.y, direction.z),
        5,
    ), //new Proton.Span(200, 500)
];

const getFireBehaviours = (
    direction,
    strength,
    colors = [PALETTES.FRENCH.MANDARIN_RED, PALETTES.FRENCH.MELON_MELODY],
) => [
    new Proton.Alpha(1, 0.1),
    new Proton.Scale(new Proton.Span(2, 2.5), 0),
    new Proton.G(strength / 100),
    new Proton.Color(colors[0], colors[1], Infinity, Proton.easeOutSine),
    new Proton.RandomDrift(direction.x / 100, direction.y / 100, direction.z / 100, 2.5),
];

export default class Fire extends ProtonParticleEmitter {
    constructor(options = {}) {
        const {
            texture,
            direction = new Vector3(0, 1, 0),
            size = 20,
            strength = 100,
            colors,
            autoEmit = false,
            emitWhenEditing = false,
            ...rest
        } = options;

        const fireOptions = {
            rate: getFireRate(),
            texture,
            initializers: getFireInitializers(direction, strength, size),
            behaviours: getFireBehaviours(direction, strength, colors),
            autoEmit,
            emitWhenEditing,
            ...rest,
        };

        super(fireOptions);
        this.setPreset("fire");
        this.setEntitySubtype(ENTITY_TYPES.PARTICLE.SUBTYPES.FIRE);
        this.setParticleConfig({
            texture,
            direction: { x: direction.x, y: direction.y, z: direction.z },
            size,
            strength,
            colors,
            autoEmit,
            emitWhenEditing,
        });
    }

    rebuild() {
        const config = this.getParticleConfig();
        const {
            texture,
            direction = { x: 0, y: 1, z: 0 },
            size = 20,
            strength = 100,
            colors,
        } = config;
        const dir = new Vector3(direction.x, direction.y, direction.z);

        this.rebuildSystem({
            rate: getFireRate(),
            initializers: getFireInitializers(dir, strength, size),
            behaviours: getFireBehaviours(dir, strength, colors),
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

    setDirection(direction) {
        this.particleConfig.direction = direction;
        this.rebuild();
    }

    getDirection() {
        return this.particleConfig.direction;
    }

    setColors(colors) {
        this.particleConfig.colors = colors;
        this.rebuild();
    }

    getColors() {
        return this.particleConfig.colors;
    }
}
