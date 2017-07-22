M.fx.particlesEngine.create('Clouds', {

    instance: function(options) {
        var particleGroup = new SPE.Group({
            texture: {
                value: options.texture
            },
            blending: THREE.NormalBlending,
            fog: true
        });
        var emitter = new SPE.Emitter({
            particleCount: options.particleCount || 750,
            maxAge: {
                value: options.maxAge || 3,
            },
            position: {
                value: options.positionValue || new THREE.Vector3(0, -15, -50),
                spread: options.positionSpread || new THREE.Vector3(100, 30, 100 )
            },
            velocity: {
               value: options.velocityValue || new THREE.Vector3(0, 0, 30),
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
                value: options.colorValue || new THREE.Color( 1, 1, 1 ),
                spread: options.colorSpread || new THREE.Color( 0.1, 0.1, 0.1 )
            },
            angle: {
                value: options.angleValue || [ 0, Math.PI * 0.125 ]
            }
        });

        particleGroup.addEmitter( emitter );
        particleGroup.clock = new THREE.Clock();

        particleGroup.render = function() {
            particleGroup.tick(particleGroup.clock.getDelta());
        }

        return particleGroup;

    }
});