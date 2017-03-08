
window.M = window.M || {};

M.lightEngine = {

    delayFactor: 0.1,
    delayStep: 30,
    holderRadius: 0.01,
    holderSegments: 1,

    init: function() {
        M.lightEngine.map = new HashMap();
        M.lightEngine.lights = [];
    },

    numLights : 0,

    //add method
    add: function(light) {
        M.lightEngine.lights.push(light);
    },

    update: function() {
        var start = new Date();
        for (var index in M.lightEngine.lights) {
            var light = M.lightEngine.lights[index];
            light.update(app.clock.getDelta());
            if ((+new Date() - start) > 50) return;
        }
    }
};

M.lightEngine.init();