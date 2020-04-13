import Config from './config';

export const generateUUID = () => {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
	}
	return s4() + s4();
};

export const include = (src, callback) => {

	var s, r, t, scripts = [];
	var _scripts = document.getElementsByTagName("script");
	for (var i=0; i<_scripts.length; i++) {
		//collecting all script names.
		scripts.push(_scripts[i].src);
	}
	var alreadyGot = function( value ) {
		for (var i=0; i<scripts.length; i++) {
			if (scripts[i].indexOf(value) != -1) {
				return true;
			}
		}
		return false;
	}
	//check if src is array or not,
	//split function in two separate parts
	if (src instanceof Array) {
		//for each element import, than call callback
		var got = 0;
		if (src.length == 0) {
			console.log("Why are you triyng to include 0 scripts? This makes me sad.")
			return;
		}
		//console.log(src);
		//console.log(src.length);
		var check = function() {
			if (got == src.length) callback();
		}
		for (var j=0; j<src.length; j++) {
			if (!alreadyGot(src[j])) {
				s = document.createElement('script');
				s.type = 'text/javascript';
				s.src = src[j] + ".js";
				if (callback) {
					s.onload = s.onreadystatechange = function() {
						if (!this.readyState || this.readyState == 'complete') {
							got++;
							check();
						}
					};
				}
				t = document.getElementsByTagName('script')[0];
				t.parentNode.insertBefore(s, t);
			} else {
				if (callback) {
					check();
				}
			}
		}
	} else if (typeof src == "string") {
		if (!alreadyGot(src)) {
			r = false;
			s = document.createElement('script');
			s.type = 'text/javascript';
			s.src = src + ".js";
			if (callback) {
				s.onload = s.onreadystatechange = function() {
					if ( !r && (!this.readyState || this.readyState == 'complete') ) {
						r = true;
						callback();
					}
				};
			}
			t = document.getElementsByTagName('script')[0];
			t.parentNode.insertBefore(s, t);
		} else {
			if (callback) {
				callback();
			}
		}
	}
}

export const degToRad = (angle) => {
    return angle * (Math.PI / 180);
}

export const getProportion = (max1, b, max2) => {
    return (max1 * b)/max2;
}

export class Checker {

	constructor() {
		this.tests = {
			'webgl': false,
			'webaudioapi': false,
			'webworker': false,
			'ajax': false
		};
	}

	isFeatureSupported(feature) {
		if (feature in this.tests) {
			return this.tests[feature];
		}

		if (typeof this[feature] === 'function') {
			return this[feature]();
		}

		return false;
	}

	check(onSuccess, onFailure) {
		const tests = Config.tests().length ?
			Config.tests() :
            Object.keys(this.tests);

        if (tests.indexOf("webgl") == -1) {
            //we MUST pass the webgl test
            tests.push("webgl");
        }

        const promises = tests
            .map(test => this[test] || Promise.reject('No such test'));


        return Promise
            .all(promises)
            .then(onSuccess)
            .catch(onFailure)
	}

	localStorage() {
		return new Promise((resolve, reject) => {
			if (window &&
	            window.localStorage &&
	            typeof window.localStorage.setItem === 'function' &&
	            typeof window.localStorage.getItem === 'function' &&
	            typeof window.localStorage.removeItem === 'function' &&
	            typeof window.localStorage.clear === 'function') {
					resolve()
				} else {
					reject();
				}
		});
	}

	offscreenCanvas() {
		return new Promise((resolve, reject) => {
			const hasOffscreenCanvas = !!window.OffscreenCanvas;

			if (hasOffscreenCanvas) {
				resolve();
			} else {
				reject();
			}
		});
	}

	webgl() {
        return new Promise((resolve, reject) => {
			try {
				const canvas = document.createElement("canvas");
	            const context = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
	            if (!context) {
	                reject();
	            } else {
	                resolve();
	            }
			} catch(e) {
				reject(e);
			}

        });
    }

    webaudioapi() {
        return new Promise((resolve, reject) => {
			try {
				const hasWebAudioApi = !!(window.webkitAudioContext || window.AudioContext);

	            if (hasWebAudioApi) {
	                resolve();
	            } else {
	                reject();
	            }
			} catch(e) {
				reject(e);
			}

        });
    }

    webworker() {
        return new Promise((resolve, reject) => {
			try {
				const hasWorkers = !!(window.Worker);

	            if (hasWorkers) {
	                resolve();
	            } else {
	                reject();
	            }
			} catch(e) {
				reject(e);
			}
        });
    }

    ajax() {
        return new Promise((resolve, reject) => {
			try {
				let xhr = null;
	            try { xhr = new XMLHttpRequest(); } catch (e) {}
	            try { xhr = new ActiveXObject("Microsoft.XMLHTTP"); } catch (e) {}
	            try { xhr = new ActiveXObject("Msxml2.XMLHTTP"); } catch (e) {}

	            if (xhr) {
	                resolve();
	            } else {
	                reject();
	            }
			} catch(e) {
				reject(e);
			}

        });
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
