Class("RightSidebar", {
    RightSidebar: function() {
        Sidebar.call(this, "right");
        this.meshViewOrder = ["meshHeader"];
        //setting 
        this.meshListener = new MeshListener();
    },

    setListeners: function() {
        //calling super method
        this._setListeners();

        //Setting mesh listeners 
        this.meshListener.setListeners();

        //setting listener for mesh selected
        app.interface.events.selectedMesh.add(this.onSelectedMesh);
        //setting listener for mesh deselect
        app.interface.events.deselectedAll.add(this.onDeselectedAll);
    },

    onSelectedMesh: function() {
        //no mesh selected message must disappear
        $('#nomeshselected').addClass('hidden');
        //retrieving object
        switch(app.sm.typeClicked) {
            case "mesh":
                //we clicked on a mesh
                app.interface.rightSidebar._handleMesh();
                break;
            case "light":
                //we clicked on a light
                app.interface.rightSidebar._handleLight();
                break;
        }
    },

    onDeselectedAll: function() {
        //no mesh selected message must appear
        $('#nomeshselected').removeClass('hidden');
    },

    // handling meshes
    _handleMesh: function(mesh) {
        //we must check element type [mesh, light, sound, model]
        //loading corresponding views
        //we should load views depending on mesh properties
        var views = ["meshHeader", "material"];
        app.interface.loader.loadArray(views, function() {
            //we are now sure views have been inflated
            //this is used only to show values for first time
            //to see what happens when values are changed,
            //see file Interface.Sidebar.MeshListener
            var o = app.mm.map.get(app.sm.uuid);

            //setting name
            $('#meshName').val(o.name);

            //setting position
            $('#position_x').val(o.position.x);
            $('#position_y').val(o.position.y);
            $('#position_z').val(o.position.z);

            //setting rotation
            $('#rotation_x').val(o.rotation.x);
            $('#rotation_y').val(o.rotation.y);
            $('#rotation_z').val(o.rotation.z);
        });
    },

    // handling light
    _handleLight: function(light) {

    }
})._extends("Sidebar");