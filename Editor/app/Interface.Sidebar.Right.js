Class("RightSidebar", {
    RightSidebar: function() {
        Sidebar.call(this, "right");
        this.meshViewOrder = ["meshHeader"];
    },

    setListeners: function() {
        //calling super method
        this._setListeners();

        //setting listener for mesh selected
        app.interface.events.selectedMesh.add(this.onSelectedMesh);
        //setting listener for mesh deselect
        app.interface.events.deselectedAll.add(this.onDeselectedAll);
    },

    onSelectedMesh: function() {
        //no mesh selected message must disappear
        $('#nomeshselected').addClass('hidden');
        //we must check element type [mesh, light, sound, model]
        //loading corresponding views
        for (var i in app.interface.rightSidebar.meshViewOrder) {
            app.interface.loader.load(app.interface.rightSidebar.meshViewOrder[i]);
        }
    },

    onDeselectedAll: function() {
        //no mesh selected message must appear
        $('#nomeshselected').removeClass('hidden');
    }
})._extends("Sidebar");