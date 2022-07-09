import {
    Router,
    store,
    Level,
    Box,
    Scene,
    Cube,
    Controls,
    Models,
    AmbientLight,
    PHYSICS_EVENTS,
    constants,
    Scripts,
    PALETTES,
    SunLight,
    HemisphereLight,
    Sky,
    Particles,
    PARTICLES,
    Sprite,
    Label
} from '../../dist/mage.js';
import UI from './ui.js';

export default class Intro extends Level {

    addAmbientLight() {
        AmbientLight.create({ color: PALETTES.FRENCH_PALETTE.SPRAY, intensity: .5 });

        HemisphereLight.create({
            color: {
                sky: PALETTES.FRENCH_PALETTE.SQUASH_BLOSSOM,
                ground: PALETTES.FRENCH_PALETTE.REEF_ENCOUNTER
            },
            intensity: 1
        });
    
        SunLight
            .create({ color: PALETTES.FRENCH_PALETTE.MELON_MELODY, intensity: 1, far: 20, mapSize: 2048 })
            .setPosition({ y: 4, z: -3, x: -3 });
    }

    createSky() {
        const sky = new Sky();
        const inclination = .1;
        const azimuth = .1;
        const distance = 100;
        
        sky.setSun(
            inclination,
            azimuth,
            distance
        );
    }

    onCreate() {
        this.addAmbientLight();
        Scene.getCamera().setPosition({ y: 10 });
        Controls.setOrbitControl();
        this.createSky();
        const cube = new Cube(1, 0xff0000);

        const label = new Label({ Component: UI, width: 3, height: 1 });
        const globalLabel = new Label({ Component: UI });
        cube.add(label, cube.getBody(), { waitForBody: 200 })
            .then(label => label.setPosition({ y: 1 }));

        cube.goTo({ x: 10, y: 0, z: 10 }, 10000);

        // setTimeout(() => label.dispose(), 10000);
    }
}

const assets = {}

const { SHADOW_TYPES } = constants;

const config = {
    screen: {
        h: window ? window.innerHeight : 800,
        w: window ? window.innerWidth : 600,
        ratio: window ? window.innerWidth / window.innerHeight : 600 / 800,
        frameRate: 60,
        alpha: true,
    },

    lights: {
        shadows: false,
        shadowType: SHADOW_TYPES.HARD,
        textureAnisotropy: 32
    },

    physics: {
        enabled: false,
        path: 'dist/ammo.js',
        gravity: { x: 0, y: -9.8, z: 0}
    },

    tween: {
        enabled: false,
    },

    ui: {
        enabled: false,
        // root: UI
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
