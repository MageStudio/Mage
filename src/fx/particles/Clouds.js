import {
    NormalBlending,
    Vector3,
    Color,
    Clock
} from 'three';

export default class Clouds {

    constructor(options) {
        this.particleGroup = new SPE.Group({
            texture: {
                value: options.texture
            },
            blending: NormalBlending,
            fog: true
        });

        this.emitter = new SPE.Emitter({
            particleCount: options.particleCount || 750,
            maxAge: {
                value: options.maxAge || 3,
            },
            position: {
                value: options.positionValue || new Vector3(0, -15, -50),
                spread: options.positionSpread || new Vector3(100, 30, 100 )
            },
            velocity: {
               value: options.velocityValue || new Vector3(0, 0, 30),
            },
            wiggle: {
                spread: options.wiggle || 10
            },
            size: {
                value: options.sizeValue || 75,
                spread: options.sizeSpread || 50
            },
            opacity: {
                value: options.opacityValue || [ 0, 1, 0 ]
            },
            color: {
                value: options.colorValue || new Color( 1, 1, 1 ),
                spread: options.colorSpread || new Color( 0.1, 0.1, 0.1 )
            },
            angle: {
                value: options.angleValue || [ 0, Math.PI * 0.125 ]
            }
        });

        this.particleGroup.addEmitter( emitter );
        this.particleGroup.clock = new Clock();
    }

    render() {
        this.particleGroup.tick(this.particleGroup.clock.getDelta());
    }
}
