function Builder() {

	this.ncp = require("ncp").ncp;
	this.colors = require("colors");
	this.global = require("node-prefix").global;

	Builder.prototype.create = function ( projectName, callback ) {

		console.log("...".blue);
		console.log("This script will create your ");
		console.log("project in just a few (milli)seconds.");

		var PATH = require.resolve('mage-engine').slice(0, -5) + "/build";

		console.log(PATH);

		this.ncp(PATH, projectName, function (err) {
			if (err) {
				console.log("\n\nSomething went wrong.".red);
				console.error(err);
				if (callback) {
					callback(false);
				}
			} else {
				console.log("Your project is ok, enjoy!".green);
				if (callback) {
					callback(true);
				}
			}
		});

		return "...";
	}
}

module.exports = new Builder();
