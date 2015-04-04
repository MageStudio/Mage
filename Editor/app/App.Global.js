Class("Global", {
    Global: function() {
        this.version = "v0.0.1";
        this.author = "Marco Stagni";
        this.website = "http://marcostagni.com";
        this.thanksTo = ["Mr Doob", "THREE.js"];
    },

    _numToHex: function(number) {
        var str = Number(number).toString(16); 
        return str.length == 1 ? "0" + str : str; 
    },

    RgbToHex: function(r, g, b) {
        return "#" + this._numToHex(r) + this._numToHex(g) + this._numToHex(b);
    }
});