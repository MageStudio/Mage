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

	checkFeatures(onSuccess, onFailure) {
        const configTests = Config.tests() || [];
		const tests = [
            ...this.tests,
            ...configTests,
        ];

        if (tests.indexOf(FEATURES.WEBGL) == -1) {
            tests.push(FEATURES.WEBGL);
        }

        const hasFailures = tests
            .map(test => this[test] && this[test]())
            .some(result => !result);


        if (hasFailures) {
            onFailure();
            return Promise.reject();
        } else {
            onSuccess();
            return Promise.resolve();
        }
	}

	localStorage() {
        if (window &&
            window.localStorage &&
            typeof window.localStorage.setItem === 'function' &&
            typeof window.localStorage.getItem === 'function' &&
            typeof window.localStorage.removeItem === 'function' &&
            typeof window.localStorage.clear === 'function') {
                return true;
            } else {
                console.log(FEATURE_NOT_SUPPORTED.concat(FEATURES.LOCALSTORAGE));
                return false;
            }
	}

	offscreenCanvas() {
        const hasOffscreenCanvas = !!window.OffscreenCanvas;

        if (hasOffscreenCanvas) {
            return true;
        } else {
            console.log(FEATURE_NOT_SUPPORTED.concat(FEATURES.OFFSCREENCANVAS));
            return false;
        }
	}

	webgl() {
        try {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
            if (context) {
                return true;
            } else {
                return false;
            }
        } catch(e) {
            console.log(FEATURE_NOT_SUPPORTED.concat(FEATURES.WEBGL));
            return false;
        }
    }

    webaudioapi() {
        try {
            const hasWebAudioApi = !!(window.webkitAudioContext || window.AudioContext);

            if (hasWebAudioApi) {
                return true;
            } else {
                console.log(FEATURE_NOT_SUPPORTED.concat(FEATURES.WEBAUDIOAPI));
                return false;
            }
        } catch(e) {
            return true;
        }
    }

    webworker() {
        try {
            const hasWorkers = !!(window.Worker);

            if (hasWorkers) {
                return true;
            } else {
                console.log(FEATURE_NOT_SUPPORTED.concat(FEATURES.WEBWORKER));
                return false;
            }
        } catch(e) {
            return true;
        }
    }

    ajax() {
        try {
            let xhr = null;
            try { xhr = new XMLHttpRequest(); } catch (e) {}
            try { xhr = new ActiveXObject("Microsoft.XMLHTTP"); } catch (e) {}
            try { xhr = new ActiveXObject("Msxml2.XMLHTTP"); } catch (e) {}

            if (xhr) {
                return true;
            } else {
                console.log(FEATURE_NOT_SUPPORTED.concat(FEATURES.AJAX));
                return false;
            }
        } catch(e) {
            return true;
        }
    }

    gamepadapi() {
        try {
            if (navigator && (
                navigator.getGamepads ||
                navigator.webkitGetGamepads ) &&
                window.Gamepad &&
                window.GamepadButton) {
                    return true;
                } else {
                    console.log(FEATURE_NOT_SUPPORTED.concat(FEATURES.GAMEPADAPI));
                    return false;
                }
        } catch(e) {
            console.log(FEATURE_NOT_SUPPORTED.concat(FEATURES.GAMEPADAPI));
            return false;
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
			function(){
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