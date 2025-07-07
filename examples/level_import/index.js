import { Router, store, Level, Scene, Controls, BaseScript } from "../../dist/mage.js";

class SimpleScript extends BaseScript {
    constructor() {
        super("SimpleScript");
    }

    start(element, { offset = 0 }) {
        this.element = element;
        this.angle = offset;
    }

    update(dt) {
        this.angle += dt;

        // this.element.setPosition({ x: Math.sin(this.angle) * 10 });
        this.element.setRotation({
            x: 2 * Math.cos(this.angle),
            y: 2 * Math.sin(this.angle),
        });
    }
}

export default class Intro extends Level {
    onCreate() {
        Scene.getCamera().setPosition({ y: 10 });
        Controls.setOrbitControl();
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

    const fullConfig = {
        ...config,
        levelsData: {
            "/": {
                data: level,
            },
        },
    };

    const fullAssets = {
        ...assets,
        "/": {
            ...assets["/"],
            scripts: {
                SimpleScript,
            },
        },
    };

    Router.start(fullConfig, fullAssets);
});
