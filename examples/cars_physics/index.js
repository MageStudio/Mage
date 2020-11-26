import { Router, store, Level, Box, Scene, Cube, Controls, Models, AmbientLight, PHYSICS_EVENTS } from '../../dist/mage.js';

export default class Intro extends Level {

    addAmbientLight() {
        this.ambientLight = new AmbientLight({ color: 0xffffff });
    }

    createWheel(index) {
        return Models.getModel('wheel', { name: `wheel_${index}` });
    }

    createCar(name) {
        return Models.getModel('car', { name });
    }

    createCube(size, color) {
        const cube = new Cube(size, color);
        cube.setPosition({ y: 15 });
        cube.enablePhysics({ mass: 1, debug: true });
    }

    handleSpeedChange({ data }) {
        //console.log(data.speed);
    }

    onCreate() {
        this.addAmbientLight();
        Controls.setOrbitControl();

        Scene
            .getCamera()
            .setPosition({ y: 15, z: 45 });

        const floor = new Box(50, 1, 50, 0xffffff);
        floor.enablePhysics({ mass: 0, debug: true });
        
        const car = this.createCar('first');
        car.setPosition({ y: 14 });

        const wheels = [
            this.createWheel(1),
            this.createWheel(2),
            this.createWheel(3),
            this.createWheel(4),
        ];

        car.addEventListener(PHYSICS_EVENTS.SPEED_CHANGE_EVENT, this.handleSpeedChange);

        car.addScript('BaseCar', {
            wheels,
            mass: 1000,
            debug: true,
            wheelsOptions: {
                back: {
                    axisPosition: -1.25,
                    radius: .35,
                    halfTrack: 1,
                    axisHeight: 0
                },
                front: {
                    axisPosition: 1.2,
                    radius: .35,
                    halfTrack: 1,
                    axisHeight: 0
                }
            },
            suspensions: {
                stiffness: 20.0,
                damping: 2.3,
                compression: 4.4,
                restLength: 0.6
            }
        });

        this.createCube(2, 0xff00ff);
    }
}

const assets = {
    models: {
        'car': 'assets/models/buggy.gltf',
        'wheel': 'assets/models/wheel.gltf'
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
