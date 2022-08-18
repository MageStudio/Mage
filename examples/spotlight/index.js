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
    easing,
    Sky,
    SpotLight,
    Cone,
    BaseScript
} from '../../dist/mage.js';

class Flicker extends BaseScript {
    start(light, { cone }) {
        this.light = light;
        this.cone = cone;
        this.isOn = true;

        const flicker = () => {
            setTimeout(() => {
                this.cone.setVisible(!this.isOn);
                this.light.dim(this.isOn ? 0 : 1, Math.random() * 50).then(() => {
                    this.isOn = !this.isOn;
                    flicker();
                });
            }, Math.random() * 1000);
        }
        
        flicker();
    }
}


export default class Intro extends Level {

    addAmbientLight() {
        const ambientLight = new AmbientLight({
            color: PALETTES.FRENCH_PALETTE.SPRAY,
            intensity: .2
        });

        const hemisphereLight = new HemisphereLight({
            color: {
                sky: PALETTES.FRENCH_PALETTE.SQUASH_BLOSSOM,
                ground: PALETTES.FRENCH_PALETTE.REEF_ENCOUNTER
            },
            intensity: .2
        });
    
        // const sunLight = new SunLight({
        //     color: PALETTES.FRENCH_PALETTE.MELON_MELODY,
        //     intensity: .1,
        //     far: 20,
        //     mapSize: 2048
        // });
        // sunLight.setPosition({ y: 4, z: -3, x: -3 });
        // sunLight.addHelper();
    }

    createSky() {
        const sky = new Sky();
        const inclination = .5;
        const azimuth = .1;
        const distance = 100;
        
        sky.setSun(
            inclination,
            azimuth,
            distance
        );

        window.sky = sky;
    }

    onCreate() {
        Scene.getCamera().setPosition({ y: 10 });
        Controls.setOrbitControl();
        this.addAmbientLight();
        this.createSky();

        Scripts.register('Flicker', Flicker);

        const floor = new Box(100, .5, 100, 0x555555);
        floor.setMaterialFromName(constants.MATERIALS.STANDARD, { roughness: .5, metalness: 0 });
        const spotlight = new SpotLight({ color: PALETTES.FRENCH.FLAT_FLESH, intensity: 1 });
        spotlight.setPosition({ y: 3.5 })

        const lamp = Models.get('lamp');
        lamp.setPosition({ z: .7 })
        lamp.setScale({ x: 3.8, y: 3.8, z: 3.8 })

        const lightCone = new Cone(1.5, 5, 0xffffff, { openEnded: true, radialSegments: 20 });
        lightCone.setOpacity(.15)
        lightCone.setPosition({ y: 1 });

        spotlight.addScript('Flicker', { cone: lightCone });

        window.spotlight = spotlight;
        window.lamp = lamp;
        window.lightCone = lightCone;
    }
}

const assets = {
    models: {
        lamp: 'assets/models/lamp.obj'
    }
}

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
        textureAnisotropy: 32
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
