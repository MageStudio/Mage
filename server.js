/**
 * a barebones HTTP server in JS
 * to serve Mage project easily
 *
 * @author marco-ponds https://github.com/marco-ponds
 *
 */

var fs = require('fs'),
	urlParser = require('url'),
	http = require('http')
	path = require('path'),
    connect = require("connect"),
    serveStatic = require("serve-static"),
    open = require('open');

function bind(method, scope) {
    return method.bind(scope);
}

function Server() {
	this.currentDir = process.cwd();
}

Server.prototype.start = function(port, location) {
    this.port = port;
    this.project = location;

    var dir = this.currentDir;

    if (this.project) {
        dir = path.join(dir, this.project);
        this.project = '/';
    }
    this.app = connect().use(serveStatic(dir));
    this.server = http.createServer(this.app);

    this.server.listen(port, bind(this.handler, this));
}

Server.prototype.handler = function(error) {
    if (error) {
        console.log(error);
        console.log('[ERROR] Shutting down mage server..'.red);

        this.server.close();
    } else {
        var msg = '[OK] Mage is serving ' + this.project + ' at http://localhost:' + this.port + ', opening browser in 1s.';
        console.log(msg.green);

        setTimeout(bind(function() {
            open('http://localhost:' + this.port);
        }, this), 1000);
    }
}

module.exports = new Server();
