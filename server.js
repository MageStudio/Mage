/**
 * a barebones HTTP server in JS
 * to serve Mage project easily
 *
 * @author zz85 https://github.com/zz85
 * @author marco-ponds https://github.com/marco-ponds
 *
 * Usage: node simplehttpserver.js <port number>
 *
 * do not use in production servers
 * and try
 *     npm install http-server -g
 * instead.
 */

var fs = require('fs'),
	urlParser = require('url'),
	http = require('http'),
	path = require('path');

function bind(method, scope) {
    return method.bind(scope);
}

function Server() {
    //http = require('http');
	//urlParser = require('url');
	//fs = require('fs');
	//path = require('path');
	this.currentDir = process.cwd();
}

Server.prototype.start = function(port, location) {
    this.port = port;
	this.location = location;

    require('dns').lookup(require('os').hostname(), function (err, addr, fam) {
		var address = addr ? addr : 'localhost';
     	console.log('Running at http://' + address  + ((port === 80) ? '' : ':') + port + '/');
    })

    console.log('Mage server has started...'.green);
	if (location.length > 0) {
		var string = 'Mage is serving ' + this.location;
		this.currentDir= path.join(this.currentDir, this.location);
		console.log(string.green);
	}
    console.log('Base directory at ' + this.currentDir);


	http.createServer(bind(this.handleRequest, this)).listen(this.port);

}

Server.prototype.handleRequest = function(request, response) {

	var urlObject = urlParser.parse(request.url, true);
	var pathname = decodeURIComponent(urlObject.pathname);

	console.log('[' + (new Date()).toUTCString().green + '] ' + '"' + request.method.red + ' ' + pathname.red + '"');

	var filePath = path.join(this.currentDir, pathname);
	console.log(filePath);

	fs.stat(filePath, bind(function(err, stats) {

		console.log(filePath);

		if (err) {
			response.writeHead(404, {});
			response.end('File not found!');
			return;
		}


		if (stats.isFile()) {

			fs.readFile(filePath, function(err, data) {

				if (err) {
					response.writeHead(404, {});
					response.end('Opps. Resource not found');
					return;
				}

				response.writeHead(200, {});
				response.write(data);
				response.end();
			});

		} else if (stats.isDirectory()) {

			fs.readdir(filePath, bind(function(error, files) {

				if (error) {
					response.writeHead(500, {});
					response.end();
					return;
				}

				var l = pathname.length;
				if (pathname.substring(l-1)!='/') pathname += '/';

				// @todo horrible solution, if files contains index.html send that
				if (files.indexOf('index.html') > -1) {

					var index = this.currentDir + pathname + 'index.html';
					
					fs.readFile(index, function(err, data) {

						if (err) {
							response.writeHead(404, {});
							response.end('Opps. Resource not found');
							return;
						}

						response.writeHead(200, {});
						response.write(data);
						response.end();
					});
				} else {
					response.writeHead(200, {'Content-Type': 'text/html'});
					response.write('<!DOCTYPE html>\n<html><head><meta charset="UTF-8"><title>' + filePath + '</title></head><body>');
					response.write('<h1>' + filePath + '</h1>');
					response.write('<ul style="list-style:none;font-family:courier new;">');
					files.unshift('.', '..');
					files.forEach(bind(function(item) {

						var urlpath = pathname + item,
							itemStats = fs.statSync(this.currentDir + urlpath);

						if (itemStats.isDirectory()) {
							urlpath += '/';
							item += '/';
						}

						response.write('<li><a href="'+ urlpath + '">' + item + '</a></li>');
					}, this));

					response.end('</ul></body></html>');
				}	
			}, this));
		}
	}, this));
}

module.exports = new Server();
