import Proton from "three.proton";
import ParticleEmitterGroup from "./ParticleEmitterGroup";
import ProtonParticleEmitter from "./ProtonParticleEmitter";
import { ENTITY_TYPES } from "../../entities/constants";

const DEFAULT_SIZE = 4;

const getTrailRate = () => new Proton.Rate(new Proton.Span(10, 20), new Proton.Span(0.01, 0.015));

const getTrailInitialisers = size => [
    new Proton.Mass(1),
    new Proton.Life(1, 2),
    new Proton.Radius(size),
];

const getTrailBehaviour = () => [
    new Proton.Alpha(1, 0),
    new Proton.Color("#ffffff"),
    new Proton.Scale(0.5, 0.1),
];

export default class Trail extends ParticleEmitterGroup {
    constructor(options = {}) {
        const { texture = false, size = DEFAULT_SIZE, autoEmit = false, emitWhenEditing = false } = options;

        const system = [
            new ProtonParticleEmitter({
                rate: getTrailRate(),
                texture,
                initializers: getTrailInitialisers(size),
                behaviours: getTrailBehaviour(size),
                skipSceneAdd: true,
            }),
        ];

        const name = "TrailGroup";

        super({ system, name, autoEmit, emitWhenEditing });
        this.setPreset("trail");
        this.setEntitySubtype(ENTITY_TYPES.PARTICLE.SUBTYPES.TRAIL);
        this.setParticleConfig({ texture, size, autoEmit, emitWhenEditing });
    }

    rebuild() {
        const config = this.getParticleConfig();
        const { texture = false, size = DEFAULT_SIZE } = config;

        const emitters = Array.from(this.system.values());
        if (emitters[0]) {
            emitters[0].rebuildSystem({
                rate: getTrailRate(),
                initializers: getTrailInitialisers(size),
                behaviours: getTrailBehaviour(size),
                texture,
            });
        }
    }

    setSize(size) {
        this.particleConfig.size = size;
        this.rebuild();
    }

    getSize() {
        return this.particleConfig.size;
    }

    setTexture(texture) {
        this.particleConfig.texture = texture;
        this.rebuild();
    }

    getTexture() {
        return this.particleConfig.texture;
    }
}
