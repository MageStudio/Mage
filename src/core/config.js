import { SHADOW_TYPES } from "../lights/constants";
import { createElementFromSelector } from "../lib/dom";
import { deepMerge } from "../lib/object";
import { getWindow } from "./window";

const DEFAULT_HEIGHT = 600;
const DEFAULT_WIDTH = 800;
const DEFAULT_RATIO = DEFAULT_WIDTH / DEFAULT_HEIGHT;

const DEFAULT_COMMON = {
    tests: [],

    scripts: {
        // [scriptId]: Script
        // e.g. "BaseCar": BaseCar,
        // where at the top of the file we have:
        // import BaseCar from "../scripts/BaseCar.js";
    },

    levelsData: {
        // [levelId]: { url: URL, data: JSON, options: {} }
    },

    screen: {
        frameRate: 60,
        alpha: true,
    },

    postprocessing: {
        enabled: false,
    },

    fog: {
        enabled: false,
        density: 0,
        color: "#ffffff",
    },

    lights: {
        shadows: true,
        shadowType: SHADOW_TYPES.BASIC,
        textureAnisotropy: 16,
    },

    physics: {
        enabled: false,
        path: "./ammo.js",
        gravity: { x: 0, y: -30, z: 0 },
        fixedTimeStep: 1 / 60,
        maxSubSteps: 3,
    },

    camera: {
        //handling useful informations about our camera.
        fov: 75,
        near: 0.1,
        far: 10000,
    },

    ui: {
        enabled: true,
    },
};

export class Config {
    constructor() {
        this.config = {
            common: { ...DEFAULT_COMMON },
            levels: {},
        };
        this.currentLevel = null;
    }

    setContainer(container) {
        this._container = container;
    }

    setConfig(config = {}) {
        const { levels = {}, ...commonOverrides } = config;
        this.config.common = deepMerge(this.config.common, commonOverrides);
        this.config.levels = deepMerge(this.config.levels, levels);
    }

    setCurrentLevel(level) {
        this.currentLevel = level;
    }

    resolve(key, level = this.currentLevel) {
        const commonValue = this.config.common[key];
        const levelValue = level ? this.config.levels[level]?.[key] : undefined;
        if (levelValue === undefined) return commonValue;
        return deepMerge(commonValue, levelValue);
    }

    container() {
        let container = document && document.querySelector(this._container);

        if (!container) {
            container = createElementFromSelector(this._container);
            document.body.appendChild(container);
        }

        return container;
    }

    tests(level) {
        return this.resolve("tests", level);
    }

    lights(level) {
        return this.resolve("lights", level);
    }

    fog(level) {
        return this.resolve("fog", level);
    }

    getContainerSize() {
        const container = this.container();
        if (!container) return false;

        const height = container.offsetHeight;
        const width = container.offsetWidth;
        const ratio = width / height;

        return { h: height, w: width, ratio };
    }

    getWindowSize() {
        const win = getWindow();

        if (!win) return false;

        const height = win.innerHeight;
        const width = win.innerWidth;
        const ratio = width / height;

        return { h: height, w: width, ratio };
    }

    getScreenDefaults() {
        return {
            h: DEFAULT_HEIGHT,
            w: DEFAULT_WIDTH,
            ratio: DEFAULT_RATIO,
        };
    }

    screen(level) {
        const { h, w, ratio } =
            this.getContainerSize() || this.getWindowSize() || this.getScreenDefaults();

        this.config.common.screen = {
            ...this.config.common.screen,
            h,
            w,
            ratio,
            devicePixelRatio: window.devicePixelRatio,
        };

        return this.resolve("screen", level);
    }

    postprocessing(level) {
        return this.resolve("postprocessing", level);
    }

    ui(level) {
        return this.resolve("ui", level);
    }

    physics(level) {
        return this.resolve("physics", level);
    }

    camera(level) {
        return this.resolve("camera", level);
    }

    scripts(level) {
        return this.resolve("scripts", level);
    }

    getLevelData(levelPath) {
        const levelsData = this.config.common.levelsData;
        return levelPath ? levelsData[levelPath] : levelsData;
    }

    toJSON() {
        return {
            postprocessing: this.postprocessing(),
            screen: this.screen(),
            fog: this.fog(),
            lights: this.lights(),
            physics: this.physics(),
            camera: this.camera(),
            ui: this.ui(),
            scripts: this.scripts(),
            tests: this.tests(),
            levelsData: this.getLevelData(),
        };
    }
}

export default new Config();
