const DEFAULT_HEIGHT = 600;
const DEFAULT_WIDTH = 800;
const DEFAULT_RATIO = DEFAULT_WIDTH / DEFAULT_HEIGHT;

class Config {

    constructor() {
        this.default = {

            tests: [],

            screen: {
                h : window ? window.innerHeight : DEFAULT_HEIGHT,
        		w : window ? window.innerWidth : DEFAULT_WIDTH,
        		ratio : window ? (window.innerWidth/window.innerHeight) : DEFAULT_RATIO,
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
        this.config.screen = {
            ...this.config.screen,
            h : window ? window.innerHeight : DEFAULT_HEIGHT,
            w : window ? window.innerWidth : DEFAULT_WIDTH,
            ratio : window ? (window.innerWidth/window.innerHeight) : DEFAULT_RATIO
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
