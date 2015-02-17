(function() {
    window.LightEngine = {

        delayFactor: 0.1,
        delayStep: 30,
        holderRadius: 0.01,
        holderSegments: 1,

        init: function() {
            LightEngine.map = new HashMap();
            LightEngine.lights = [];
        },

        numLights : 0,

        //add method
        add: function(light) {
            LightEngine.lights.push(light);
        },

        update: function() {
            var start = new Date();
            for (var index in LightEngine.lights) {
                var light = LightEngine.lights[index];
                with(light) {
                    setTimeout(function() {
                        update(core.clock.getDelta());
                    }, 0);
                }
                if ((+new Date() - start) > 50) return;
            }
        }
    };

    LightEngine.init();

})();