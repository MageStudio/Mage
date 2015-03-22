window.Util = window.Util || {};
var config = window.config || {};

Util.tests = ["webgl", "webaudioapi", "webworker", "ajax"];

Util.start = function() {
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

Util.check = {

    start: function(onSuccess, onFailure) {
        var tests = config.tests || Util.tests;

        if (tests.indexOf("webgl") == -1) {
            //we MUST pass the webgl test
            tests.push("webgl");
        }

        for (var k in tests) {
            if (Util.tests.indexOf(tests[k]) == -1) {
                onFailure("No Such Test", tests[k]);
                return false;
            }
            if (!Util.check[tests[k]]()) {
                onFailure("Test failed", tests[k]);
                return false;
            }
        }
        onSuccess("All systems are go!");
        return true;
    },

    webgl: function() {
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        if (!context) {
            return false;
        }
        return true;
    },

    webaudioapi: function() {
        return !!(window.webkitAudioContext || window.AudioContext);
    },

    webworker: function() {
        return !!window.Worker;
    },

    ajax: function() {
        var xhr = null;
        try { xhr = new XMLHttpRequest(); } catch (e) {}
        try { xhr = new ActiveXObject("Microsoft.XMLHTTP"); } catch (e) {}
        try { xhr = new ActiveXObject("Msxml2.XMLHTTP"); } catch (e) {}
        return (xhr!=null);
    }

};

Util.degToRad = function(angle) {
    return angle * (Math.PI / 180);
}

Util.getProportion = function(max1, b, max2) {
    return (max1 * b)/max2;
}
