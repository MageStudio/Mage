import { Router, store, Level, Box, Scene, Controls, AmbientLight, Particles, PARTICLES, Cube, BaseScript, Scripts } from '../../dist/mage.js';

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
        const fire = Particles.addParticleEmitter(PARTICLES.FIRE, {
            texture: 'fire',
            strength: 50,
            size: 5,
            direction: { x: 0, y: 1, z: 0}
        });

        fire.emit(Infinity);
        
        const cube = new Cube(30, 0xff0000);
        cube.setPosition({ z: -20 });
        
        cube.add(fire);
        cube.addScript('simple');
        fire.setPosition({ y: 1 });

        window.cube = cube;
        window.fire = fire;
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
