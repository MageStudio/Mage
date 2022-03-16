import { Router, store, Level, Box, Scene, Controls, AmbientLight, Particles, PARTICLES, Cube, BaseScript, Scripts, THREE, ProtonParticleEmitter, Proton, ParticleEmitterGroup } from '../../dist/mage.js';

class SimpleScript extends BaseScript {
    constructor() { super('SimpleScript'); }

    start(element, { offset }) {
        this.element = element;
        this.angle = offset;
    }

    update(dt) {
        this.angle += 10 * dt;

        // this.element.setPosition({ x: Math.sin(this.angle) * 10 });
        this.element.setPosition({
            x: 2 * Math.cos(this.angle),
            y: 2 * Math.sin(this.angle)
        });
    }
}

const { Vector3 } = THREE;

const getRate = () => new Proton.Rate(new Proton.Span(15, 20), new Proton.Span(.01, .02));

const getInitializers = (direction, strength, size) => ([
    new Proton.Mass(1),
    new Proton.Life(0.5, 1),
    new Proton.Radius(size / 2, size / 1.5, 'center'),
    new Proton.Position(new Proton.SphereZone(size)),
    // new Proton.V(new Proton.Span(strength, strength * 2), new Proton.Vector3D(direction.x, direction.y, direction.z), 5), //new Proton.Span(200, 500)
]);

const getBehaviours = (direction, strength) => ([
    new Proton.Scale(new Proton.Span(2, 1), 0),
    // new Proton.G(strength / 100),
    new Proton.Color('#3c6382', ['#82ccdd', '#60a3bc'], Infinity, Proton.easeOutSine),
    // new Proton.RandomDrift(direction.x / 100, direction.y / 100, direction.z / 100, 2.5),
    // new Proton.Force(0, 10, 0, Infinity),
    new Proton.Attraction(new Proton.Vector3D(0, 0, 0), -strength, 2, Infinity)
]);

class CustomParticleEmitter extends ProtonParticleEmitter {

    constructor(options) {
        const  {
            texture,
            direction = new Vector3(0, 1, 0),
            size = 20,
            strength = 100
        } = options;

        const fireOptions = {
            rate: getRate(),
            texture,
            initializers: getInitializers(direction, strength, size),
            behaviours: getBehaviours(direction, strength)
        }

        super(fireOptions);
    }
}

class Sparkler extends ParticleEmitterGroup {

    constructor(options = {}) {
        const system = [
            new CustomParticleEmitter({
                texture: 'fire',
                strength: 100,
                size: .1,
                direction: { x: 0, y: 1, z: 0}
            }),
            new CustomParticleEmitter({
                texture: 'fire',
                strength: 100,
                size: .1,
                direction: { x: 0, y: 1, z: 0}
            }),
            new CustomParticleEmitter({
                texture: 'fire',
                strength: 100,
                size: .1,
                direction: { x: 0, y: 1, z: 0}
            }),
            new CustomParticleEmitter({
                texture: 'fire',
                strength: 100,
                size: .1,
                direction: { x: 0, y: 1, z: 0}
            }),
            new CustomParticleEmitter({
                texture: 'fire',
                strength: 100,
                size: .1,
                direction: { x: 0, y: 1, z: 0}
            })
        ];

        system.forEach(emitter => emitter.addScript('simple', { offset: Math.random() }));

        const name = 'Sparkler';

        super({ system, name });
    }
}

export default class Intro extends Level {

    addAmbientLight() {
        this.ambientLight = new AmbientLight({ color: 0xffffff });
    }

    createFloor() {
        const floor = new Box(50, 1, 50, 0xffffff);

        floor.setPosition({ y: -5 });
    }

    startFire() {
        console.log('starting fire');
        const fire = Particles.addParticleEmitter(new Sparkler());

        fire.emit(Infinity);
        
        // const cube = new Cube(30, 0xff0000);
        // cube.setPosition({ z: -20 });
        
        // cube.add(fire);
        // cube.addScript('simple');
        fire.setPosition({ y: 1 });
        // fire.addScript('simple');

        // window.cube = cube;
    }

    onKeyDown({ event }) {
        console.log(event);
        if (event.key === 'f') {
            this.startFire();
        }
    }

    onCreate() {
        this.addAmbientLight();
        Controls.setOrbitControl();
        Scripts.create('simple', SimpleScript);

        Scene
            .getCamera()
            .setPosition({ y: 15, z: 45 });

        // this.createFloor();
        this.startFire();
    }
}

const assets = {
    textures: {
        'dot': 'dot.png',
        'fire': 'fire.png'
    }
};

const config = {
    screen: {
        h: window ? window.innerHeight : 800,
        w: window ? window.innerWidth : 600,
        ratio: window ? window.innerWidth / window.innerHeight : 600 / 800,
        frameRate: 60,
        alpha: true,
    },

    lights: {
        shadows: true,
    },

    physics: {
        enabled: false,
        path: 'dist/ammo.js',
        gravity: { x: 0, y: -9.8, z: 0}
    },

    tween: {
        enabled: false,
    },

    camera: {
        fov: 75,
        near: 0.1,
        far: 3000000,
    },
};

window.addEventListener('load', () => {
    store.createStore({}, {}, true);

    Router.on('/', Intro);

    Router.start(config, assets);
});
