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
                h : win ? win.innerHeight : DEFAULT_HEIGHT,
        		w : win ? win.innerWidth : DEFAULT_WIDTH,
        		ratio : win ? (win.innerWidth/win.innerHeight) : DEFAULT_RATIO,
        		frameRate : 60,
                alpha: true
            },

            lights: {
                shadows: true
            },

            physics: {
                enabled: false
            },

            tween: {
                enabled: false
            },

    		camera : {
    			//handling useful informations about our camera.
    			fov : 75,
    			near : 0.1,
    			far : 100
    		}
        }
    }

    setConfig(config) {
        this.config = {
            ...this.default,
            ...config
        };
    }

    tests() {
        return this.config.tests;
    }

    lights() {
        return this.config.lights;
    }

    screen() {
        const win = getWindow();
        this.config.screen = {
            ...this.config.screen,
            h : win ? win.innerHeight : DEFAULT_HEIGHT,
            w : win ? win.innerWidth : DEFAULT_WIDTH,
            ratio : win ? (win.innerWidth/win.innerHeight) : DEFAULT_RATIO
        }
        return this.config.screen;
    }

    tween() {
        return this.config.tween;
    }

    physics() {
        return this.config.physics;
    }

    camera() {
        return this.config.camera;
    }
}

export default new Config();
