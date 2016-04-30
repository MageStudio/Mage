var game = {};

window.addEventListener("load", function() {

    function loadData() {
        var data = JSON.parse(this.responseText);

        game.name = data.name;
        game.author = data.author;
        game.description = data.description;

        Router.init({
            "scenes": data.scenes,
            "firstScene": data.firstScene
        });
    }
    
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", loadData);
    oReq.open("GET", "game.json");
    oReq.send();
});
