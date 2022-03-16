import { Router, store, Level, Box, Scene, Controls, AmbientLight, Particles, Models, Cube, BaseScript, Scripts, THREE, ProtonParticleEmitter, Proton } from '../../dist/mage.js';

class SimpleScript extends BaseScript {
    constructor() { super('SimpleScript'); }

    start(element) {
        this.element = element;
        this.angle = 0;
    }

    update(dt) {
        this.angle += 5 * dt;

        this.element.setPosition({ x: Math.sin(this.angle) * 10 });
        this.element.setRotation({ x: Math.sin(this.angle) });
    }
}

const getRate = () => new Proton.Rate(new Proton.Span(2, 5), new Proton.Span(2, 2.1));

const getInitializers = (direction, strength, size) => ([
    new Proton.Mass(1),
    new Proton.Life(1, 2),
    // new Proton.Radius(size / 2, size / 1.5, 'center'),
    new Proton.Position(new Proton.SphereZone(.5)),
    new Proton.V(new Proton.Span(strength, strength * 2), new Proton.Vector3D(direction.x, direction.y, direction.z), 5), //new Proton.Span(200, 500)
]);

const getBehaviours = (direction, strength) => ([
    new Proton.Scale(new Proton.Span(1.3, 1.2), 0.5),
    // new Proton.Scale(2, 0),
    new Proton.Alpha(1, 0),
    // new Proton.G(-.01),
    new Proton.Color('#FF0026', ['#ffff00', '#ffff11'], Infinity, Proton.easeOutSine)
    // new Proton.RandomDrift(direction.x / 100, direction.y / 100, direction.z / 100, 2.5)
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

export default class Intro extends Level {

    addAmbientLight() {
        this.ambientLight = new AmbientLight({ color: 0xffffff });
    }

    createFloor() {
        const floor = new Box(50, 1, 50, 0xffffff);

        floor.setPosition({ y: -5 });

        return floor;
    }

    startFire(floor) {
        console.log('starting fire');
        const fire = Particles.addParticleEmitter(new CustomParticleEmitter({
            texture: 'fire',
            strength: 10,
            size: .2,
            direction: { x: 0, y: 1, z: 0}
        }));

        fire.emit(Infinity);
        
        // const cube = new Cube(30, 0xff0000);
        // cube.setPosition({ z: -20 });
        // cube.setWireframe(true);
        
        // cube.add(fire);

        const tile = Models.getModel('tile');
        tile.add(fire);
        // cube.addScript('simple');
        // fire.setPosition({ y: 1 });

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

        const f = this.createFloor();
        this.startFire(f);
    }
}

const assets = {
    textures: {
        'dot': 'dot.png',
        'fire': 'green_energy.png'
    },
    models: {
        tile: 'hex_forest_roadB.gltf.glb'
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
