import {
    Router,
    store,
    Level,
    Box,
    Scene,
    Controls,
    AmbientLight,
    AmbientSound,
    Input,
    INPUT_EVENTS,
    Cube,
    DirectionalSound,
    easing,
    Models,
    HemisphereLight,
    SunLight,
    PALETTES,
    constants,
    Sky,
    Lights,
    Particles,
    PARTICLES,
    PointLight,
    BaseScript,
    Scripts,
    Audio,
    AUDIO_RAMPS,
    GameRunner,
    Universe,
} from "../../dist/mage.js";

const AMBIENTLIGHT_OPTIONS = {
    color: PALETTES.FRENCH_PALETTE.SPRAY,
    intensity: 0.1,
};

const HEMISPHERELIGHT_OPTIONS = {
    color: {
        sky: PALETTES.FRENCH_PALETTE.SQUASH_BLOSSOM,
        ground: PALETTES.FRENCH_PALETTE.REEF_ENCOUNTER,
    },
    intensity: 0.1,
};

class Flicker extends BaseScript {
    start(light) {
        this.light = light;
        this.isOn = true;

        const flicker = () => {
            setTimeout(() => {
                this.light.dim(this.isOn ? 0.7 : 1, Math.random() * 250).then(() => {
                    this.isOn = !this.isOn;
                    flicker();
                });
            }, Math.random() * 500);
        };

        flicker();
    }
}

export default class Example extends Level {
    addAmbientLight() {
        AmbientLight.create(AMBIENTLIGHT_OPTIONS);
        HemisphereLight.create(HEMISPHERELIGHT_OPTIONS);

        SunLight.create({
            color: PALETTES.FRENCH_PALETTE.MELON_MELODY,
            intensity: 0.1,
            far: 20,
            mapSize: 2048,
        }).setPosition({ y: 4, z: -3, x: -3 });
        // Lights.createCascadeShadowMaps({ cascades: 4 });
    }

    createSky() {
        const sky = new Sky();
        const inclination = 0.51;
        const azimuth = 0.1;
        const distance = 100;

        sky.setSun(inclination, azimuth, distance);
    }

    createFire() {
        const fire = Particles.addParticleEmitter(PARTICLES.FIRE, {
            texture: "fire",
            strength: 0.08,
            size: 0.03,
            direction: { x: 0, y: 1, z: 0 },
        });

        fire.emit(Infinity);
        fire.setPosition({ y: 1, x: -0.5, z: -0.3 });

        const fireLight = new PointLight({ color: PALETTES.FRENCH.CARROT_ORANGE });
        fire.add(fireLight);
        fireLight.setPosition({ y: 0.1 });
        fireLight.addScript("Flicker");

        return fire;
    }

    onCreate() {
        Audio.setVolume(0.5);
        this.addAmbientLight();
        // this.createSky();
        Controls.setOrbitControls();
        Controls.setTransformControl();

        const transform = Controls.getControl("transform");

        Input.enableMouse({ recursiveSearch: true });
        Input.addEventListener(INPUT_EVENTS.ELEMENT_CLICK, ({ elements }) => {
            const filtered = elements[0] || {};
            console.log(elements, filtered);

            if (filtered.element) {
                // const selection = filtered.element.hasTag(constants.TAGS.HELPER)
                //     ? filtered.element.getHelperTarget()
                //     : filtered.element;
                // this.dispatchElementSelected(selection);
                transform.attach(Universe.get(filtered.element.getName()));
            }
        });
        // loading a Model on button click
        const button = document.querySelector(".button");

        Scene.getCamera().setPosition({ x: -0.74, y: 1.62, z: 0.8 });

        Scene.getCamera().lookAt({ x: 0, y: 1, z: 0 });

        const scene = Models.get("scene");
        scene.setMaterialFromName(constants.MATERIALS.STANDARD, { roughness: 0.5, metalness: 0 });
        this.createFire();

        button.addEventListener("click", () => {
            const loadPoliceCar = (options = {}) => {
                let car;
                Models.removeEventListener("requirements:missing:car");
                Models.addEventListener("requirements:missing:car", () => {
                    if (car) car.dispose();
                    loadPoliceCar({
                        material: "materials/car_police.mtl",
                        texture: "textures/citybits_texture.png",
                    });
                });
                Models.loadAssetByPath("car_police.obj", "car", options).then(() => {
                    car = Models.get("car");
                    car.setRotation({ y: 1 });
                    car.setPosition({ y: 1.35, x: 0.3, z: 0.2 });
                    car.setMaterialFromName(constants.MATERIALS.STANDARD, {
                        roughness: 0.5,
                        metalness: 0,
                    });
                });
            };

            const loadBox = (options = {}) => {
                let box;
                Models.removeEventListener("requirements:missing:box");
                Models.onMissingRequirements("box", () => {
                    if (box) box.dispose();
                    loadBox({
                        texture: "textures/citybits_texture.png",
                    });
                });
                Models.loadAssetByPath("box_A.fbx", "box", options).then(() => {
                    box = Models.get("box");
                    box.setRotation({ y: 1 });
                    box.setScale({ x: 4, y: 4, z: 4 });
                    box.setPosition({ y: 1.35, x: 0.3, z: -1.5 });
                    box.setMaterialFromName(constants.MATERIALS.STANDARD, {
                        roughness: 0.5,
                        metalness: 0,
                    });
                });
            };

            const loadFireHydrant = (options = {}) => {
                let hydrant;
                Models.removeEventListener("requirements:missing:firehyd");
                Models.addEventListener("requirements:missing:firehyd", () => {
                    if (hydrant) hydrant.dispose();
                    loadFireHydrant({
                        binary: "materials/firehydrant.bin",
                        texture: "textures/citybits_texture.png",
                    });
                });

                Models.loadAssetByPath("firehydrant.gltf", "firehyd", options).then(() => {
                    hydrant = Models.get("firehyd");
                    hydrant.setRotation({ y: 1 });
                    hydrant.setPosition({ y: 1.35, x: 0.3, z: 1.3 });
                    hydrant.setMaterialFromName(constants.MATERIALS.STANDARD, {
                        roughness: 0.5,
                        metalness: 0,
                    });
                });
            };

            loadBox();
            loadPoliceCar();
            loadFireHydrant();
        });
    }
}

const assets = {
    audio: {
        // radio: 'radiotune.mp3',
        // fire: 'fire.wav',
        // swat: 'swat.mp3',
        // forest: "forest.mp3",
    },
    textures: {
        // fire: "fire.png",
        // sound: "sound.png",
    },
    models: {
        // radio: "radio.obj",
        scene: "simplescene.obj",
    },
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
        textureAnisotropy: 1,
    },

    physics: {
        enabled: false,
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

    Router.on("/", Example);

    Router.start(config, assets);
});
