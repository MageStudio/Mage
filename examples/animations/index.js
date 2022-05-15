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
    PARTICLES
} from '../../dist/mage.js';

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
        Scene.getCamera().setPosition({ y: 10 });
        Controls.setOrbitControl();
        this.addAmbientLight();
        this.createSky();
        
        // const animated = Models.getModel('animated');
        const skeleton = Models.get('skeleton');
        const duck = Models.get('duck');
        const eyeballs = [
            Particles.addParticleEmitter(PARTICLES.FIRE, {
                texture: 'fire',
                strength: 20,
                size: 3,
                direction: { x: 0, y: 1, z: 0},
                name: 'rightEyeball',
                colors: [PALETTES.FRENCH.WATERFALL, PALETTES.FRENCH.PARADISE_GREEN]
            }),
            Particles.addParticleEmitter(PARTICLES.FIRE, {
                texture: 'fire',
                strength: 20,
                size: 3,
                direction: { x: 0, y: 1, z: 0},
                name: 'leftEyeball',
                colors: [PALETTES.FRENCH.WATERFALL, PALETTES.FRENCH.PARADISE_GREEN]
            }),
        ];

        const [rightEyeball, leftEyeball] = eyeballs;

        skeleton.add(eyeballs, skeleton.getBodyByName('Head'));

        rightEyeball.emit(Infinity);
        rightEyeball.setPosition({x: -0.2, y: 0.35, z: 0.3});

        leftEyeball.emit(Infinity);
        leftEyeball.setPosition({x: 0.2, y: 0.35, z: 0.3});

        skeleton.playAnimation(skeleton.getAvailableAnimations()[5])

        skeleton.setMaterialFromName(constants.MATERIALS.STANDARD, { roughness: .5, metalness: 0 });
        duck.setMaterialFromName(constants.MATERIALS.STANDARD, { roughness: .5, metalness: 0 });
    }
}

const assets = {
    '/': {
        models: {
            'animated': 'assets/animated.fbx',
            'duck': 'assets/duck_animation.fbx',
            'skeleton': 'assets/skeleton_animation.fbx',
        },
        textures: {
            'fire': 'assets/fire.png'
        }
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
