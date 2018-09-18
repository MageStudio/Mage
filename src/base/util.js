window.M = window.M || {};

M.util = M.util || {};

M.include(src, callback) {

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

M.util.tests = ["webgl", "webaudioapi", "webworker", "ajax"];

M.util.start = function() {
    // @see http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame    ||
              window.oRequestAnimationFrame      ||
              window.msRequestAnimationFrame     ||
              function(/* function */ callback, /* DOMElement */ element){
                window.setTimeout(callback, 1000 / 60);
              };
    })();
};

M.util.check = {
    // @todo use promises
    start: function(onSuccess, onFailure) {
        const tests = (app &&
            app.util &&
            app.util.tests) ||
            M.util.tests;

        if (tests.indexOf("webgl") == -1) {
            //we MUST pass the webgl test
            tests.push("webgl");
        }

        const promises = tests
            .map(test => M.util.check[test] || Promise.reject('No such test'));

        console.log(promises);

        return Promise
            .all(promises)
            .then(onSuccess)
            .catch(onFailure)
    },

    webgl: function() {
        return new Promise((resolve, reject) => {
            var canvas = document.createElement("canvas");
            var context = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
            if (!context) {
                reject();
            } else {
                resolve();
            }
        });
    },

    webaudioapi: function() {
        return new Promise((resolve, reject) => {
            const hasWebAudioApi = !!(window.webkitAudioContext || window.AudioContext);

            if (hasWebAudioApi) {
                resolve();
            } else {
                reject();
            }
        });
    },

    webworker: function() {
        return new Promise((resolve, reject) => {
            const hasWorkers = !!(window.Worker);

            if (hasWorkers) {
                resolve();
            } else {
                reject();
            }
        });
    },

    ajax: function() {
        return new Promise((resolve, reject) => {
            var xhr = null;
            try { xhr = new XMLHttpRequest(); } catch (e) {}
            try { xhr = new ActiveXObject("Microsoft.XMLHTTP"); } catch (e) {}
            try { xhr = new ActiveXObject("Msxml2.XMLHTTP"); } catch (e) {}

            if (xhr) {
                resolve();
            } else {
                reject();
            }
        });
    }
};

M.util.degToRad = function(angle) {
    return angle * (Math.PI / 180);
}

M.util.getProportion = function(max1, b, max2) {
    return (max1 * b)/max2;
}
