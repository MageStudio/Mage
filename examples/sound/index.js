import { Router, store, Level, Box, Scene, Controls, AmbientLight, Sound } from '../../dist/mage.js';

export default class Example extends Level {

    addAmbientLight() {
        this.ambientLight = new AmbientLight({ color: 0xffffff });
    }

    createFloor() {
        const floor = new Box(50, 1, 50, 0xffffff);

        floor.setPosition({ y: -5 });
    }

    playSound() {
        new Sound('click').play();
    }

    onKeyDown({ event }) {
        console.log(event);
        if (event.key === 'e') {
            this.playSound();
        }
    }

    onCreate() {
        this.addAmbientLight();
        Controls.setOrbitControl();

        Scene
            .getCamera()
            .setPosition({ y: 15, z: 45 });

        // this.createFloor();/
    }
}

const assets = {
    audio: {
        'click': 'click.ogg'
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

    Router.on('/', Example);

    Router.start(config, assets);
});
