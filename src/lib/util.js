import Config from '../core/config';

export const FEATURES = {
    WEBGL: 'webgl',
    WEBAUDIOAPI: 'webaudioapi',
    WEBWORKER: 'webworker',
    LOCALSTORAGE: 'localStorage',
    AJAX: 'ajax',
    OFFSCREENCANVAS: 'offscreenCanvas',
    GAMEPADAPI: 'gamepadapi'
};

export class Checker {

    constructor() {
        this.tests = [
            FEATURES.WEBGL,
            FEATURES.WEBAUDIOAPI,
            FEATURES.WEBWORKER,
            FEATURES.LOCALSTORAGE,
            FEATURES.AJAX
        ];
    }

    isFeatureSupported(feature) {
        return typeof this[feature] === 'function' && this[feature]();
    }

    checkFeatures() {
        const configTests = Config.tests() || [];
        const tests = [
            ...this.tests,
            ...configTests,
        ];

        if (tests.indexOf(FEATURES.WEBGL) == -1) {
            tests.push(FEATURES.WEBGL);
        }


        const failures = tests
            .map(test => this[test] && this[test]())
            .reduce((acc, result) => {
                if (!result.success) {
                    acc.push(result.name);
                }
                return acc;
            }, []);


        return failures.length ? 
            Promise.reject(failures) :
            Promise.resolve();
    }

    localStorage() {
        if (window &&
            window.localStorage &&
            typeof window.localStorage.setItem === 'function' &&
            typeof window.localStorage.getItem === 'function' &&
            typeof window.localStorage.removeItem === 'function' &&
            typeof window.localStorage.clear === 'function') {
                return {
                    success: true,
                    name: FEATURES.LOCALSTORAGE
                };
            } else {
                return {
                    success: false,
                    name: FEATURES.LOCALSTORAGE
                };
            }
    }

    offscreenCanvas() {
        const hasOffscreenCanvas = !!window.OffscreenCanvas;

        return {
            success: hasOffscreenCanvas,
            name: FEATURES.OFFSCREENCANVAS
        };
    }

    webgl() {
        try {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
            if (context) {
                return {
                    success: true,
                    name: FEATURES.WEBGL
                };
            } else {
                return {
                    success: false,
                    name: FEATURES.WEBGL
                };
            }
        } catch(e) {
            return {
                success: false,
                name: FEATURES.WEBGL
            };
        }
    }

    webaudioapi() {
        try {
            const hasWebAudioApi = !!(window.webkitAudioContext || window.AudioContext);

            if (hasWebAudioApi) {
                return {
                    success: true,
                    name: FEATURES.WEBAUDIOAPI
                };
            } else {
                return {
                    success: false,
                    name: FEATURES.WEBAUDIOAPI
                };
            }
        } catch(e) {
            return {
                success: false,
                name: FEATURES.WEBAUDIOAPI
            };
        }
    }

    webworker() {
        try {
            const hasWorkers = !!(window.Worker);

            if (hasWorkers) {
                return {
                    success: true,
                    name: FEATURES.WEBWORKER
                };
            } else {
                return {
                    success: true,
                    name: FEATURES.WEBWORKER
                };
            }
        } catch(e) {
            return {
                success: false,
                name: FEATURES.WEBWORKER
            };
        }
    }

    ajax() {
        try {
            let xhr = null;
            try { xhr = new XMLHttpRequest(); } catch (e) {}
            try { xhr = new ActiveXObject("Microsoft.XMLHTTP"); } catch (e) {}
            try { xhr = new ActiveXObject("Msxml2.XMLHTTP"); } catch (e) {}

            if (xhr) {
                return {
                    success: true,
                    name: FEATURES.AJAX
                };
            } else {
                return {
                    success: false,
                    name: FEATURES.AJAX
                };
            }
        } catch(e) {
            return {
                success: false,
                name: FEATURES.AJAX
            };
        }
    }

    gamepadapi() {
        try {
            if (navigator && (
                navigator.getGamepads ||
                navigator.webkitGetGamepads ) &&
                window.Gamepad &&
                window.GamepadButton) {
                    return {
                        success: true,
                        name: FEATURES.GAMEPADAPI
                    };
                } else {
                    return {
                        success: true,
                        name: FEATURES.GAMEPADAPI
                    };
                }
        } catch(e) {
            return {
                success: false,
                name: FEATURES.GAMEPADAPI
            };
        }
    }
}

export class Util {

    constructor() {
        this.checker = new Checker();
    }

    isFeatureSupported(feature) {
        return this.checker.isFeatureSupported(feature);
    }

    start() {
        window.requestAnimFrame = (
            function() {
                return  window.requestAnimationFrame       ||
                        window.webkitRequestAnimationFrame ||
                        window.mozRequestAnimationFrame    ||
                        window.oRequestAnimationFrame      ||
                        window.msRequestAnimationFrame     ||
                        function(callback, element){
                            window.setTimeout(callback, 1000 / 60);
                        };
            }
        )();
    }
}

export default new Util();