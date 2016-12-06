function Builder() {

	this.ncp = require("ncp").ncp;
	this.colors = require("colors");
	this.global = require("node-prefix").global;

	Builder.prototype.create = function ( projectName, callback ) {

		console.log("...".blue);
		console.log("This script will create your ");
		console.log("project in just a few (milli)seconds.");

		var PATH = this.global("mage-engine")+"/build";

		console.log(PATH);

		this.ncp(PATH, projectName, function (err) {
			if (err) {
				console.log("\n\nSomething went wrong.");
				console.error(err);
				if (callback) {
					callback(false);
				}
				return console.log("...".blue);
			} else {
				console.log("Your project is ok, enjoy!");
				if (callback) {
					callback(true);
				}
				return console.log("...\n\n".blue);
			}
		});

		return "...";
	}
}

module.exports = new Builder();
