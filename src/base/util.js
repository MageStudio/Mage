window.M = window.M || {};

M.util = M.util || {};

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
