Class("Sidebar", {
    Sidebar: function(type) {
        this.type = type;
    },

    setListeners: function() {
        $('#'+this.type+"-column").mouseenter(function() {
            app.interface.isModalShowing = true;
        }).mouseleave(function() {
            app.interface.isModalShowing = false;
        });
    }
});