import { Router, store } from '../../../dist/mage';
import Level from './level';

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
        path: 'http://localhost:8085/dist/ammo.js',
        gravity: { x: 0, y: 0, z: 0}
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

    Router.on('/', Level);

    Router.start(config, assets);
});
