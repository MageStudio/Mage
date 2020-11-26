import { isClassname, isId, createElementFromSelector } from '../lib/dom';
import { removeFirst } from '../lib/strings';
import { getWindow } from './window';

const DEFAULT_HEIGHT = 600;
const DEFAULT_WIDTH = 800;
const DEFAULT_RATIO = DEFAULT_WIDTH / DEFAULT_HEIGHT;

class Config {

    constructor() {

        const win = getWindow();

        this.default = {

            tests: [],

            screen: {
                frameRate : 60,
                alpha: true
            },

            fog: {
                enabled: false,
                density: 0,
                color: '#ffffff'
            },

            lights: {
                shadows: true
            },

            physics: {
                enabled: false,
                path: './mage.physics.js'
            },

            camera : {
                //handling useful informations about our camera.
                fov : 75,
                near : 0.1,
                far : 100
            },

            ui: {}
        }

        this.isDefault = true;
    }

    setContainer(container) {
        this._container = container;
    }

    setConfig(config) {
        if (this.isDefault) {
            this.isDefault = false;
            this.config = {
                ...this.default,
                ...config
            };
        } else {
            this.config = {
                ...this.config,
                config
            };
        }

    }

    container() {
        let container = document && document.querySelector(this._container);

        if (!container) {
            container = createElementFromSelector(this._container);
            document.body.appendChild(container);
        }

        return container;
    }

    tests() {
        return this.config.tests;
    }

    lights() {
        return this.config.lights;
    }

    fog() {
        return this.config.fog;
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

    getDefaults() {
        return {
            h: DEFAULT_HEIGHT,
            w: DEFAULT_WIDTH,
            ratio: DEFAULT_RATIO
        };
    }

    screen() {
        const { h, w, ratio } = this.getContainerSize() ||
            this.getWindowSize() ||
            this.getDefaults();

        this.config.screen = {
            ...this.config.screen,
            h,
            w,
            ratio,
            devicePixelRatio: window.devicePixelRatio
        };

        return this.config.screen;
    }

    ui() {
        return this.config.ui;
    }

    physics() {
        return this.config.physics;
    }

    camera() {
        return this.config.camera;
    }
}

export default new Config();
