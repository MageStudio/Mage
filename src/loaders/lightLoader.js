app.lightLoader = {
    load: function(lights) {
        for (var j=0; j<lights.length; j++) {
            var current = lights[j]
                parsedLight = app.lightLoader._parseLight(current);

            if (current.light.object.type == "DirectionalLight") {
                app.lightLoader._loadDirectionalLight(parsedLight);
            } else if (current.light.object.type == "AmbientLight") {
                app.lightLoader._loadAmbientLight(parsedLight);
            } else if (current.light.object.type == "PointLight") {
                app.lightLoader._loadPointLight(parsedLight);
            }
        }
    }

    _parseLight: function(light) {
        return {
            holder: (light.holder) ? app.loader.parse(light.holder) : false,
            target: (light.target) ? app.loader.parse(light.target) : false,
            light: (light.light) ? app.loader.parse(light.light) : false
        };
    },

    _loadDirectionalLight: function(light) {
        new DirectionalLight(light.light.color, light.light.intensity, light.light.distance, light.light.position, light.target);
    },

    _loadAmbientLight: function(light) {
        new AmbientLight(light.light.color, light.light.intensity, light.light.position);
    },

    _loadPointLight: function(light) {
        var d = 200;
        var position = light.holder ? light.holder.position : light.light.position;
        var pointlight = new PointLight(light.light.color, light.light.intensity, d, position);
        pointlight.light.castShadow = true;
        pointlight.light.shadow.camera.left = -d;
        pointlight.light.shadow.camera.right = d;
        pointlight.light.shadow.camera.top = d;
        pointlight.light.shadow.camera.bottom = -d;
        pointlight.light.shadow.camera.far = app.util.camera.far;
        pointlight.light.shadow.darkness = 0.2;
    }
}
