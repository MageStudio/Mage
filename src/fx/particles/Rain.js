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
                value: options.positionValue || new THREE.Vector3(0, 0, -50),
                spread: options.positionSpread || new THREE.Vector3( 0, 0, 0 )
            },
            acceleration: {
                value: options.accelerationValue || new THREE.Vector3(0, -10, 0),
                spread: options.accelerationSpread || new THREE.Vector3( 10, 0, 10 )
            },
            velocity: {
                value: options.velocityValue || new THREE.Vector3(0, 25, 0),
                spread: options.velocitySpread || new THREE.Vector3(10, 7.5, 10)
            },
            color: {
                value: options.colorValue || [ new THREE.Color('white'), new THREE.Color('red') ]
            },
            size: {
                value: options.sizeValue || 10
            },
            particleCount: options.particleCount || 2000
        });

        this.particleGroup.addEmitter(this.emitter);
        this.particleGroup.clock = new THREE.Clock();
    }

    render() {
        this.particleGroup.tick(this.particleGroup.clock.getDelta());
    }
}
