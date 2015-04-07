Class("LightListener", {
    LightListener: function() {},

    setListeners: function() {
        //setting position change event listener
        app.interface.events.positionChange.add(this.onPositionChange);
        //setting rotation change event listener
        app.interface.events.rotationChange.add(this.onRotationChange);

        //setting position change event listener
        app.interface.events.positionChange.add(this.onPositionChange);
        //setting rotation change event listener
        app.interface.events.rotationChange.add(this.onRotationChange);

        //setting material listeners
        app.interface.events.lightColorChange.add(this.onLightColorChange);
        app.interface.events.lightVisibleChange.add(this.onLightVisibleChange);

        //setting listeners for shadow
        app.interface.events.lightShowCameraChange.add(this.onLightShowCameraChange);
        app.interface.events.lightCastShadowChange.add(this.onLightCastShadowChange);
        app.interface.events.lightReceiveShadowChange.add(this.onLightReceiveShadowChange);
    },

    //position change listener
    onPositionChange: function() {
        if (app.sm.typeClicked != "light") return;
        var position = app.lm.map.get(app.sm.uuid).holder ? app.lm.map.get(app.sm.uuid).holder.position : app.lm.map.get(app.sm.uuid).light.position;
        //writing new position
        $('#position_x').val(position.x);
        $('#position_y').val(position.y);
        $('#position_z').val(position.z);
    },

    //rotation change listener
    onRotationChange: function() {
        if (app.sm.typeClicked != "light") return;
        var rotation = app.lm.map.get(app.sm.uuid).holder ? app.lm.map.get(app.sm.uuid).holder.rotation : app.lm.map.get(app.sm.uuid).light.rotation;
        //writing new rotation
        $('#rotation_x').val(rotation.x);
        $('#rotation_y').val(rotation.y);
        $('#rotation_z').val(rotation.z);
    },

    //on light color change
    onLightColorChange: function(color) {
        if (app.sm.typeClicked != "light") return;
        app.lm.map.get(app.sm.uuid).light.color = new THREE.Color(color);
    },

    //on light visible change
    onLightVisibleChange: function(flag) {
        if (app.sm.typeClicked != "light") return;
        app.lm.map.get(app.sm.uuid).light.visible = flag;
    },

    //on light receive shadow change
    onLightReceiveShadowChange: function(flag) {
        if (app.sm.typeClicked != "light") return;
        app.lm.map.get(app.sm.uuid).light.receiveShadow = flag;
    },

    //event listner for cast shadow
    onLightCastShadowChange: function(flag) {
        if (app.sm.typeClicked != "light") return;
        //app.lm.map.get(app.sm.uuid).light.castShadow = flag;
        //app.lm.map.get(app.sm.uuid).light.shadowCameraVisible = flag;
        if (flag) {
            app.lm.map.get(app.sm.uuid).light.shadowCameraFar = 1000;
            app.lm.map.get(app.sm.uuid).light.shadowDarkness = 0.2;
        } else {
            app.lm.map.get(app.sm.uuid).light.shadowCameraFar = 1;
            app.lm.map.get(app.sm.uuid).light.shadowDarkness = 0;
        }
        /*
        //app.lm.map.get(app.sm.uuid).light.shadowCameraVisible = true;

        light.shadowBias = 0.0001;
        light.shadowDarkness = 0.5;

        //light.shadowMapWidth = 2048;
        //light.shadowMapHeight = 1024;
        //TEMP below
        
        light.shadowMapWidth = 512;
        light.shadowMapHeight = 512;

        var d = 200;

        light.shadowCameraLeft = -d;
        light.shadowCameraRight = d;
        light.shadowCameraTop = d;
        light.shadowCameraBottom = -d;

        light.shadowCameraFar = 1000;
        light.shadowDarkness = 0.2;
        */
    },

    //toggling light camera helper
    onLightShowCameraChange: function(flag) {
        if (app.sm.typeClicked != "light") return;
        app.lm.map.get(app.sm.uuid).light.shadowCameraVisible = flag;
    },

    //mesh update rotation, position and name
    updateLightRotPosName: function() {
        if (app.sm.typeClicked != "light") return;
        var o = app.lm.map.get(app.sm.uuid);

        if (o.holder) {
            //setting name
            o.light.name = $('#lightName').val();
            //setting group
            o.light.group = $('#lightGroup').val();
            //setting position 
            o.holder.position.set($('#position_x').val(), $('#position_y').val(), $('#position_z').val());
            //settting rotation
            o.holder.rotation.set($('#rotation_x').val(), $('#rotation_y').val(), $('#rotation_z').val());
        } else {
            //setting name
            o.light.name = $('#lightName').val();
            //setting group
            o.light.group = $('#lightGroup').val();
            //setting position 
            o.light.position.set($('#position_x').val(), $('#position_y').val(), $('#position_z').val());
            //settting rotation
            o.light.rotation.set($('#rotation_x').val(), $('#rotation_y').val(), $('#rotation_z').val());
        }
        //setting decay, intensity and distance
        o.light.intensity = !isNaN(parseFloat($('#intensity').val())) ? parseFloat($('#intensity').val()) : 0 ;
        o.light.decay = !isNaN(parseFloat($('#decay').val())) ? parseFloat($('#decay').val()) : 0 ;
        o.light.distance = !isNaN(parseFloat($('#distance').val())) ? parseFloat($('#distance').val()) : 0 ;
    },
});