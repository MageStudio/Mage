Class("MeshListener", {
    MeshListener: function() {

    },

    setListeners: function() {
        //setting position change event listener
        app.interface.events.positionChange.add(this.onPositionChange);
        //setting rotation change event listener
        app.interface.events.rotationChange.add(this.onRotationChange);
    },

    //position change listener
    onPositionChange: function() {
        if (app.sm.typeClicked != "mesh") return;
        var position = app.mm.map.get(app.sm.uuid).position;
        //writing new position
        $('#position_x').val(position.x);
        $('#position_y').val(position.y);
        $('#position_z').val(position.z);
    },

    //rotation change listener
    onRotationChange: function() {
        if (app.sm.typeClicked != "mesh") return;
        var rotation = app.mm.map.get(app.sm.uuid).rotation;
        //writing new rotation
        $('#rotation_x').val(rotation.x);
        $('#rotation_y').val(rotation.y);
        $('#rotation_z').val(rotation.z);
    }

});