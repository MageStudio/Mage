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
    Color,
    Sky,
} from "../../dist/mage.js";

export default class Intro extends Level {
    addAmbientLight() {
        const ambientLight = new AmbientLight({
            color: PALETTES.FRENCH_PALETTE.SPRAY,
            intensity: 0.5,
        });

        const hemisphereLight = new HemisphereLight({
            color: {
                sky: PALETTES.FRENCH_PALETTE.SQUASH_BLOSSOM,
                ground: PALETTES.FRENCH_PALETTE.REEF_ENCOUNTER,
            },
            intensity: 1,
        });

        const sunLight = new SunLight({
            color: PALETTES.FRENCH_PALETTE.MELON_MELODY,
            intensity: 1,
            far: 20,
            mapSize: 2048,
        });
        sunLight.setPosition({ y: 4, z: -3, x: -3 });
        // sunLight.addHelpers();
    }

    createSky() {
        const sky = new Sky();
        const inclination = 0.1;
        const azimuth = 0.1;
        const distance = 100;

        sky.setSun(inclination, azimuth, distance);
    }

    createCube() {
        const size = 2;
        const color = Color.randomColor(true);
        const cube = new Cube(size, color);
        const position = {
            x: Math.random() * 30 - 15,
            z: Math.random() * 30 - 15,
            y: Math.random() * 10 + 10,
        };

        const rotation = {
            x: Math.random(),
            y: Math.random(),
            z: Math.random(),
        };

        cube.setPosition(position);
        cube.setRotation(rotation);
        cube.setWireframe(true);

        return cube;
    }

    onCreate() {
        Scene.getCamera().setPosition({ y: 10 });
        Controls.setOrbitControl();
        this.addAmbientLight();
        this.createSky();

        const bottom = this.createCube();
        const other = this.createCube();
        other.add(bottom);
        const lonely = this.createCube();

        console.log(Scene.getHierarchy());
    }
}

const assets = {};

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
        shadows: true,
        shadowType: SHADOW_TYPES.HARD,
        textureAnisotropy: 32,
    },

    physics: {
        enabled: true,
        path: "dist/ammo.js",
        gravity: { x: 0, y: -9.8, z: 0 },
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

window.addEventListener("load", () => {
    store.createStore({}, {}, true);

    Router.on("/", Intro);

    Router.start(config, assets);
});
