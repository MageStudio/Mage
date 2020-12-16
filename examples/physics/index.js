import { Router, store, Level, Box, Cube, Sphere, Scene, Controls, Color, PHYSICS_COLLIDER_TYPES } from '../../dist/mage.js';

class Intro extends Level {

    createCube() {
        const size = 2;
        const color = Color.randomColor(true);
        const cube = new Cube(size, color);
        const position = {
            x: Math.random() * 30 - 15,
            z: Math.random() * 30 - 15,
            y: Math.random() * 10 + 10
        }

        const rotation = {
            x: Math.random(),
            y: Math.random(),
            z: Math.random()
        }

        cube.setPosition(position);
        cube.setRotation(rotation);
        cube.enablePhysics({ debug: true, mass: 1 });
    }

    createSphere() {
        const radius = 2;
        const color = Color.randomColor(true);
        const sphere = new Sphere(radius, color);
        const position = {
            x: Math.random() * 30 - 15,
            y: Math.random() * 30 - 15,
            z: Math.random() * 10 + 10
        }

        const rotation = {
            x: Math.random(),
            y: Math.random(),
            z: Math.random()
        }

        sphere.setPosition(position);
        sphere.setRotation(rotation);
        sphere.enablePhysics({ debug: true, mass: 1, colliderType: PHYSICS_COLLIDER_TYPES.SPHERE });
    }

    spawnItems(count) {
        if (count === 0) return;

        setTimeout(() => {
            Math.random() >  0.5 ? this.createCube() : this.createSphere();
            this.spawnItems(count - 1);
        }, 500)
    }

    onCreate() {
        Controls.setOrbitControl();

        Scene
            .getCamera()
            .setPosition({ y: 15, z: 45 });

        const floor = new Box(50, 1, 50, 0xffffff);

        floor.enablePhysics({ mass: 0, debug: true });

        this.spawnItems(100);
    }
}

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
        enabled: true,
        path: 'dist/ammo.js'
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

    Router.start(config, {});
});
