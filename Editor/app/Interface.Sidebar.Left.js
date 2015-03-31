Class("LeftSidebar", {
    LeftSidebar: function() {
        Sidebar.call(this, "left");
    },

    setListeners: function() {
        //calling the super method
        this._setListeners();
        
        //setting listener on fog slider
        $('#fogDensity').change(function() {
            console.log($(this).val());
        });
    }
})._extends("Sidebar");