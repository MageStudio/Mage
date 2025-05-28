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
    new Proton.Scale(new Proton.Span(2, 2.5), 0),
    new Proton.G(strength / 100),
    new Proton.Color(colors[0], colors[1], Infinity, Proton.easeOutSine),
    new Proton.RandomDrift(direction.x / 100, direction.y / 100, direction.z / 100, 2.5),
];

export default class Fire extends ProtonParticleEmitter {
    constructor(options) {
        const {
            texture,
            direction = new Vector3(0, 1, 0),
            size = 20,
            strength = 100,
            colors,
            ...rest
        } = options;

        const fireOptions = {
            rate: getFireRate(),
            texture,
            initializers: getFireInitializers(direction, strength, size),
            behaviours: getFireBehaviours(direction, strength, colors),
            ...rest,
        };

        super(fireOptions);
        this.setEntitySubtype(ENTITY_TYPES.PARTICLE.SUBTYPES.FIRE);
    }
}
