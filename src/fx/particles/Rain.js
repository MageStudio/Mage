M.fx.particlesEngine.create('Rain', {
    /*
    instance: function(options) {
        var opts = {
            positionStyle    : Type.CUBE,
            positionBase     : new THREE.Vector3( 0, 200, 0 ),
            positionSpread   : new THREE.Vector3( 600, 0, 600 ),

            velocityStyle    : Type.CUBE,
            velocityBase     : new THREE.Vector3( 0, -400, 0 ),
            velocitySpread   : new THREE.Vector3( 10, 50, 10 ),
            accelerationBase : new THREE.Vector3( 0, -10,0 ),

            //particleTexture : THREE.ImageUtils.loadTexture( 'img/raindrop2flip.png' ),

            sizeBase    : 8.0,
            sizeSpread  : 4.0,
            colorBase   : new THREE.Vector3(0.66, 1.0, 0.7), // H,S,L
            colorSpread : new THREE.Vector3(0.00, 0.0, 0.2),
            opacityBase : 0.6,

            particlesPerSecond : 1000,
            particleDeathAge   : 1.0,
            emitterDeathAge    : 60
        };

        Object.assign(opts, options);

        var system = new ParticleSystem();
	    system.setValues(opts);
	    system.initialize();

        return system;
    },*/

    instance: function(options) {
        var particleGroup = new SPE.Group({
            texture: {
                value: options.texture
            }
        });
        var emitter = new SPE.Emitter({
            maxAge: {
                value: 2
            },
            position: {
                value: new THREE.Vector3(0, 0, -50),
                spread: new THREE.Vector3( 0, 0, 0 )
            },
            acceleration: {
                value: new THREE.Vector3(0, -10, 0),
                spread: new THREE.Vector3( 10, 0, 10 )
            },
            velocity: {
                value: new THREE.Vector3(0, 25, 0),
                spread: new THREE.Vector3(10, 7.5, 10)
            },
            color: {
                value: [ new THREE.Color('white'), new THREE.Color('red') ]
            },
            size: {
                value: 1
            },
            particleCount: 2000
        });
        particleGroup.addEmitter( emitter );
        particleGroup.clock = new THREE.Clock();

        particleGroup.render = function() {
            particleGroup.tick(particleGroup.clock.getDelta());
        }

        return particleGroup;
    }
});