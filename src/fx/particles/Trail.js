import Proton from 'three.proton.js';
import ParticleEmitterGroup from './ParticleEmitterGroup';
import ProtonParticleEmitter from './ProtonParticleEmitter';

const DEFAULT_SIZE = 4;

const getTrailRate = () => new Proton.Rate(
    new Proton.Span(10, 20),
    new Proton.Span(0.01, 0.015)
);

const getTrailInitialisers = (size) => ([
    new Proton.Mass(1),
    new Proton.Life(1, 2),
    new Proton.Radius(size),
]);

const getTrailBehaviour = () => ([
    new Proton.Alpha(1, 0),
    new Proton.Color("#ffffff"),
    new Proton.Scale(.5, 0.1)
])

export default class Trail extends ParticleEmitterGroup {

    constructor(options = {}) {
        const {
            texture = false,
            size = DEFAULT_SIZE
        } = options;

        const system = [
            new ProtonParticleEmitter({
                rate: getTrailRate(),
                texture,
                initializers: getTrailInitialisers(size),
                behaviours: getTrailBehaviour(size)
            })
        ];

        const name = 'TrailGroup';

        super({ system, name });
    }
}