import { Router, store, Level, Cube, Scene, Controls, AmbientLight, Particles, PARTICLES, BaseScript, Scripts, BUILTIN } from '../../dist/mage.js';

class SimpleScript extends BaseScript {
    constructor() { super('SimpleScript'); }

    start(element) {
        this.element = element;
        this.angle = 0;
    }

    update(dt) {
        this.angle += 5 * dt;

        this.element.setPosition({ x: Math.sin(this.angle) * 10 });
    }
}

export default class Intro extends Level {

    addAmbientLight() {
        this.ambientLight = new AmbientLight({ color: 0xffffff });
    }

    createCube() {
        const cube = new Cube(1, 0xeeeaaa);

        cube.addScript('SimpleScript');
        const trail = Particles.addParticleEmitter(PARTICLES.TRAIL, { texture: 'particle' });
        trail.emit(Infinity);
        cube.add(trail);

        // trail.addScript('SimpleScript');


        cube.setWireframe(true);
    }

    onCreate() {
        Scripts.create('SimpleScript', SimpleScript);
        this.addAmbientLight();
        Controls.setOrbitControl();

        this.createCube();

        Scene
            .getCamera()
            .setPosition({ y: 15, z: 45 });
    }
}

const assets = {
    textures: {
        particle: 'particle.png'
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
