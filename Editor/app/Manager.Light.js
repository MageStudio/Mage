Class("LightManager", {
    LightManager: function() {
        // light map
        this.map = new HashMap();
        // lights list
        this.lights = [];
        // allowed lights
        this.allowedLights = [
            "ambientLight",
            "pointLight",
            "directionalLight"
        ];
        //lights count
        this.lightCount = 0;
    },

    setListeners: function() {
        //do nothing, right now
    },

    store: function(uuid, element) {
        this.map.put(uuid, element);
    },

    update: function() {
        //updating lights
        var keys_list = this.map.keys.concat();   //create a clone of the original
        if (keys_list.length != 0) {
            var start = +new Date();
            do {
                var o = this.map.get(keys_list.shift());
                if (o.holder) {
                    o.light.position.copy(o.holder.position);
                    o.light.updateMatrixWorld();
                }
                if (o.target) {
                    o.light.target.position.copy(o.target.position);
                    o.light.target.updateMatrixWorld();
                }
                if (o.helper) {
                    o.helper.update();
                }
            } while (keys_list.length > 0 && (+new Date() - start < 50));
        }
    },

    addLight: function(type) {
        if (this.allowedLights.indexOf(type) != -1) {
            var object = this["_add"+__upperCaseFirstLetter__(type)]();
            //setting light name
            object.light.name = "Light_"+this.lightCount;
            object.light.flag = "light";
            object.light.group = "World";
            //add light to scene
            app.sm.scene.add(object.light)
            //pushing light into array
            app.lm.lights.push(object.light);
            //storing this light
            app.lm.store(object.light.uuid, object);
            //forcing scene update
            app.sm.update();
            //setting
            app.sm.uuid = object.light.uuid;
            app.sm.typeClicked = "light";
            //adding to transform
            if (object.holder) {
                app.sm.select(object.holder, "translate");
            } else {
                app.sm.select(object.light, "translate");
            }
            //check if this light has helper
            if (object.helper) {
                //adding helper to scene
                app.sm.scene.add(object.helper);
                //ading helper to mesh lists
                app.mm.meshes.push(object.helper);
                //adding click listener to helper
                app.interface.meshEvents.bind(object.helper, "click", function(event) {
                    //now only adding this mesh to the transform control
                    if (app.sm.lastClicked.uuid === event.target.light.uuid) return;
                    app.sm.deselect();
                    //Setting uuid to the scene
                    app.sm.uuid = event.target.light.uuid;
                    app.sm.typeClicked = "light";
                    app.sm.select(event.target.light, "translate");
                });
                //calling addedmesh event
                app.interface.events.meshAdded.dispatch();
            }
            //check if this has target
            if (object.target) {
                //Setting target name
                object.target.name = "Target_"+this.lightCount;
                object.target.flag = "target";
                //add target to the scene
                app.sm.scene.add(object.target);
                //adding target to meshes list
                // #TODO remove this when exporting
                app.mm.meshes.push(object.target);
                //adding click listener to target
                app.interface.meshEvents.bind(object.target, "click", function(event) {
                    if (app.sm.lastClicked.uuid === event.target.uuid) return;
                    app.sm.deselect();
                    app.sm.select(event.target, "translate");
                });
                //calling addedmesh event
                app.interface.events.meshAdded.dispatch();
            }
            //check if we need to use holder
            if (object.holder) {
                //Setting holder name
                object.holder.name = "Holder_"+this.lightCount;
                object.holder.flag = "holder";
                //adding holder to the scene
                app.sm.scene.add(object.holder);
                //adding holder to meshesh list -- do we really need to do this?
                // #TODO remove this when exporting
                app.mm.meshes.push(object.holder);
                //adding click listener to holder
                app.interface.meshEvents.bind(object.holder, "click", function(event) {
                    if (app.sm.lastClicked.uuid === event.target.uuid) return;
                    app.sm.deselect();
                    app.sm.uuid = object.light.uuid;
                    app.sm.typeClicked = "light";
                    app.sm.select(event.target, "translate");
                });
                //calling addedmesh event
                app.interface.events.meshAdded.dispatch();
            }
            //increasing light count
            this.lightCount++;
            //triggering light added event
            app.interface.events.lightAdded.dispatch();
        }
    },

    // lights

    _addAmbientLight: function() {
        var light;

        light = new THREE.AmbientLight(0x404040);

        var geo = new THREE.SphereGeometry(20, 4, 4);
        var mat = new THREE.MeshBasicMaterial({wireframe: false, color: 0x0000ff});
        var holder = new THREE.Mesh(geo, mat);

        return {
            "light": light,
            "helper": false,
            target: false,
            holder: holder,
            flag: "light"
        };

    },

    _addPointLight: function() {
        var pointLight = new THREE.PointLight(0xff0000, 1, 100);
        pointLight.position.set(10, 10, 10);

        var sphereSize = 50;
        var pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);

        //every light must cast shadow
        pointLight.castShadow = true;
        var d = 200;
        pointLight.shadowCameraLeft = -d;
        pointLight.shadowCameraRight = d;
        pointLight.shadowCameraTop = d;
        pointLight.shadowCameraBottom = -d;
        // #TODO be able to change shadow camera far
        pointLight.shadowCameraFar = 1000;
        pointLight.shadowDarkness = 0.2;

        return {
            light: pointLight,
            helper: pointLightHelper,
            target: false,
            holder: false,
            flag: "light"
        };
    },

    _addDirectionalLight: function() {
        var directionalLight = new THREE.DirectionalLight( 0xffffff, 1.75 );
        directionalLight.position.set( 0, 1, 0 );

        var size = 50;
        var directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, size);

        var geo = new THREE.SphereGeometry(20, 4, 4);
        var mat = new THREE.MeshBasicMaterial({wireframe: false, color: 0x0000ff});
        var target = new THREE.Mesh(geo, mat);
        var holder = new THREE.Mesh(geo, mat);

        //every light must cast shadow
        directionalLight.castShadow = true;
        directionalLight.shadowCameraVisible = true;

        directionalLight.shadowMapWidth = 512;
        directionalLight.shadowMapHeight = 512;

        var d = 200;
        directionalLight.shadowCameraLeft = -d;
        directionalLight.shadowCameraRight = d;
        directionalLight.shadowCameraTop = d;
        directionalLight.shadowCameraBottom = -d;
        // #TODO be able to change shadow camera far
        directionalLight.shadowCameraFar = 1000;
        directionalLight.shadowDarkness = 0.2;

        return {
            light: directionalLight,
            helper: directionalLightHelper,
            target: target,
            holder: holder,
            flag: "light"
        };
    }

});