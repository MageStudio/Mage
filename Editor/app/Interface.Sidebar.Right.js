Class("RightSidebar", {
    RightSidebar: function() {
        Sidebar.call(this, "right");
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
    },

    onDeselectedAll: function() {
        //no mesh selected message must appear
        $('#nomeshselected').removeClass('hidden');
    }
})._extends("Sidebar");