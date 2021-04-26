import Config from '../core/config';

export const FEATURES = {
    WEBGL: 'webgl',
    WEBAUDIOAPI: 'webaudioapi',
    WEBWORKER: 'webworker',
    LOCALSTORAGE: 'localStorage',
    AJAX: 'ajax',
    OFFSCREENCANVAS: 'offscreenCanvas',
    GAMEPADAPI: 'gamepadapi',
    MEMORY: 'memory'
};

export class Features {

    constructor() {
        this.tests = [
            FEATURES.WEBGL,
            FEATURES.WEBAUDIOAPI,
            FEATURES.WEBWORKER,
            FEATURES.LOCALSTORAGE,
            FEATURES.AJAX
        ];
    }

    setUpPolyfills() {
        const frameRate = Config.screen().frameRate;

        window.requestNextFrame = (
            function() {
                return  window.requestAnimationFrame       ||
                        window.webkitRequestAnimationFrame ||
                        window.mozRequestAnimationFrame    ||
                        window.oRequestAnimationFrame      ||
                        window.msRequestAnimationFrame     ||
                        function(callback, element){
                            window.setTimeout(callback, 1000 / frameRate);
                        };
            }
        )();
    }

    isFeatureSupported(feature) {
        if (typeof this[feature] === 'function') {
            const { success } = this[feature]();

            return success;
        }

        return false;
    }

    checkSupportedFeatures() {
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
                    success: false,
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
                        success: false,
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

    memory() {
        try {
            if (performance && 
                performance.memory &&
                performance.memory.usedJSHeapSize &&
                performance.memory.jsHeapSizeLimit) {
                    return {
                        success: true,
                        name: FEATURES.MEMORY
                    };
                } else {
                    return {
                        success: false,
                        name: FEATURES.MEMORY
                    };
                }
        } catch(e) {
            return {
                success: false,
                name: FEATURES.MEMORY
            };
        }
    }
}

export default new Features();