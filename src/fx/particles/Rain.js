import {
    Vector3,
    Color,
    Clock
} from 'three';

export default class Rain {

    constructor(options) {
        this.particleGroup = new SPE.Group({
            texture: {
                value: options.texture
            }
        });

        this.emitter = new SPE.Emitter({
            maxAge: {
                value: options.maxAge || 2
            },
            position: {
                value: options.positionValue || new Vector3(0, 0, -50),
                spread: options.positionSpread || new Vector3( 0, 0, 0 )
            },
            acceleration: {
                value: options.accelerationValue || new Vector3(0, -10, 0),
                spread: options.accelerationSpread || new Vector3( 10, 0, 10 )
            },
            velocity: {
                value: options.velocityValue || new Vector3(0, 25, 0),
                spread: options.velocitySpread || new Vector3(10, 7.5, 10)
            },
            color: {
                value: options.colorValue || [ new Color('white'), new Color('red') ]
            },
            size: {
                value: options.sizeValue || 10
            },
            particleCount: options.particleCount || 2000
        });

        this.particleGroup.addEmitter(this.emitter);
        this.particleGroup.clock = new Clock();
    }

    render() {
        this.particleGroup.tick(this.particleGroup.clock.getDelta());
    }
}
