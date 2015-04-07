Class("Sidebar", {
    Sidebar: function(type) {
        this.type = type;
    },

    setListeners: function() {
        //disabling events on mouse enter
        $('#'+this.type+"-column").mouseenter(function() {
            app.interface.disableEvents = true;
        }).mouseleave(function() {
            app.interface.disableEvents = false;
        }).mouseover(function() {
            app.interface.disableEvents = true;
        });;
    }
});