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
} from "../../dist/mage.js";

export default class Intro extends Level {
    addAmbientLight() {
        AmbientLight.create({
            color: PALETTES.FRENCH_PALETTE.SPRAY,
            intensity: 0.5,
        });

        HemisphereLight.create({
            color: {
                sky: PALETTES.FRENCH_PALETTE.SQUASH_BLOSSOM,
                ground: PALETTES.FRENCH_PALETTE.REEF_ENCOUNTER,
            },
            intensity: 1,
        });

        SunLight.create({
            color: PALETTES.FRENCH_PALETTE.MELON_MELODY,
            intensity: 1,
            far: 20,
            mapSize: 2048,
        }).setPosition({ y: 4, z: -3, x: -3 });
    }

    createSky() {
        Sky.create({
            sunInclination: 0.1,
            sunAzimuth: 0.1,
            sunDistance: 100,
        });
    }

    onCreate() {
        Scene.getCamera().setPosition({ y: 10 });
        Controls.setOrbitControl();
        this.addAmbientLight();
        // this.createSky();
    }
}

const loadJSON = url => {
    return fetch(url)
        .then(response => response.json())
        .then(data => data);
};

const loadExportedData = async () => {
    const assets = await loadJSON("./data/assets.json");
    const config = await loadJSON("./data/config.json");
    const level = await loadJSON("./data/snapshot.json");

    return { assets, config, level };
};

window.addEventListener("load", async () => {
    store.createStore({}, {}, true);

    Router.on("/", Intro);

    const { assets, config, level } = await loadExportedData();

    console.log("assets", assets);
    console.log("config", config);
    console.log("level", level);

    const fullConfig = {
        ...config,
        levelsData: {
            "/": {
                url: "data/snapshot.json",
            },
        },
    };

    Router.start(fullConfig, assets);
});
