import { Router, store, Level, Box, Scene, Controls, AmbientLight, AmbientSound, Input, INPUT_EVENTS, Cube, DirectionalSound, easing, Models, HemisphereLight, SunLight, PALETTES, constants, Sky, Lights, Particles, PARTICLES, PointLight, BaseScript } from '../../dist/mage.js';

const AMBIENTLIGHT_OPTIONS = {
    color: PALETTES.FRENCH_PALETTE.SPRAY,
    intensity: .1
};

const HEMISPHERELIGHT_OPTIONS = {
    color: {
        sky: PALETTES.FRENCH_PALETTE.SQUASH_BLOSSOM,
        ground: PALETTES.FRENCH_PALETTE.REEF_ENCOUNTER
    },
    intensity: .1
};

class Flicker extends BaseScript {

    start(light) {
        this.light = light;
    }
}

export default class Example extends Level {

    addAmbientLight() {
        AmbientLight.create(AMBIENTLIGHT_OPTIONS);
        HemisphereLight.create(HEMISPHERELIGHT_OPTIONS);
    
        SunLight.create({
            color: PALETTES.FRENCH_PALETTE.MELON_MELODY,
            intensity: .1,
            far: 20,
            mapSize: 2048
        }).setPosition({ y: 4, z: -3, x: -3 })
        // Lights.createCascadeShadowMaps({ cascades: 4 });
    }

    createSky() {
        const sky = new Sky();
        const inclination = .8;
        const azimuth = .1;
        const distance = 100;
        
        sky.setSun(
            inclination,
            azimuth,
            distance
        );
    }

    createFire() {
        const fire = Particles.addParticleEmitter(PARTICLES.FIRE, {
            texture: 'fire',
            strength: .08,
            size: .03,
            direction: { x: 0, y: 1, z: 0}
        });

        fire.emit(Infinity);
        fire.setPosition({ y: 1, x: -.5, z: -.3 })

        const fireLight = new PointLight({ color: PALETTES.FRENCH.CARROT_ORANGE });
        fire.add(fireLight);
        fireLight.setPosition({ y: .1 })

        window.fireLight = fireLight;
        window.fire = fire;
    }

    onCreate() {
        this.addAmbientLight();
        Controls.setOrbitControl();
        this.createSky();

        Scene
            .getCamera()
            .setPosition({ y: 5, z: 5 });

        const scene = Models.get('scene');
        scene.setMaterialFromName(constants.MATERIALS.STANDARD, { roughness: .5, metalness: 0 });

        const radio = Models.get('radio');
        window.radio = radio;
        radio.setRotation({ y: 1 })
        radio.setPosition({ y: 1.35, x: .3, z: .2 })
        radio.setMaterialFromName(constants.MATERIALS.STANDARD, { roughness: .5, metalness: 0 });

        this.createFire();

        document.querySelector('.button').addEventListener('click', () => {
            radio.add(new DirectionalSound('radio', { autoplay: true, loop: true, rolloffFactor: .4, refDistance: .1 }));
        });
    }
}

const assets = {
    audio: {
        radio: 'radio.wav'
    },
    textures: {
        fire: 'fire.png'
    },
    models: {
        radio: 'radio.obj',
        scene: 'simplescene.obj'
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
        shadowType: constants.SHADOW_TYPES.SOFT,
        textureAnisotropy: 1
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
