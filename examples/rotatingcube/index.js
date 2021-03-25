import {
    Router,
    store,
    Level,
    RenderPipeline,
    Cube,
    Controls,
    AmbientLight,
    Scripts,
    BaseScript,
    Stats
} from '../../dist/mage.js';

class RotationScript extends BaseScript {

    constructor() {
        super('rotation');
    }

    start(mesh) {
        this.mesh = mesh;
        this.angle = 0;
    }

    update(dt) {
        this.angle += 0.01;

        this.mesh.setRotation({
            y: this.angle
        });
    }
}

export default class Intro extends Level {

    addAmbientLight() {
        this.ambientLight = new AmbientLight({ color: 0xffffff });
    }

    createCube(size, color) {
        const cube = new Cube(size, color);
        cube.addScript('rotation');

        window.cube = cube;
    }

    onCreate() {
        Scripts.create('rotation', RotationScript);
        Stats.fps.subscribe(console.log);
        this.addAmbientLight();
        Controls.setOrbitControl();

        RenderPipeline.setClearColor(0xffffff);

        RenderPipeline
            .getCamera()
            .setPosition({ y: 0, z: 25 });
        
        // window.camera = RenderPipeline.getScene();

        this.createCube(2, 0xaa55ff);
    }
}

const assets = {}

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

    beta: { offscreen: true }
};

window.addEventListener('load', () => {
    store.createStore({}, {}, true);

    Router.on('/', Intro);

    Router.start(config, assets);
});
