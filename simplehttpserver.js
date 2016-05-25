/**
 * a barebones HTTP server in JS
 * to serve three.js and Wage project easily
 *
 * @author zz85 https://github.com/zz85
 *
 * Usage: node simplehttpserver.js <port number>
 *
 * do not use in production servers
 * and try
 *     npm install http-server -g
 * instead.
 */

function bind(method, scope) {
    return method.bind(scope);
}

function Server() {
    this.http = require('http');
	this.urlParser = require('url');
	this.fs = require('fs');
	this.path = require('path');
	this.currentDir = process.cwd();
}

Server.prototype.start = function(port) {
    this.port = port;

    this.http.createServer(this.handleRequest).listen(this.port);


    require('dns').lookup(require('os').hostname(), function (err, addr, fam) {
     	console.log('Running at http://' + addr  + ((port === 80) ? '' : ':') + port + '/');
    })

    console.log('Wage server has started...'.green);
    console.log('Base directory at ' + this.currentDir);
}

Server.prototype.handleRequest = function(request, response) {

	var urlObject = this.urlParser.parse(request.url, true);
	var pathname = decodeURIComponent(urlObject.pathname);

	console.log('[' + (new Date()).toUTCString() + '] ' + '"' + request.method + ' ' + pathname + '"');

	var filePath = this.path.join(this.currentDir, pathname);

	this.fs.stat(filePath, bind(function(err, stats) {

		if (err) {
			response.writeHead(404, {});
			response.end('File not found!');
			return;
		}

		if (this.stats.isFile()) {

			this.fs.readFile(filePath, function(err, data) {

				if (err) {
					response.writeHead(404, {});
					response.end('Opps. Resource not found');
					return;
				}

				response.writeHead(200, {});
				response.write(data);
				response.end();
			});

		} else if (this.stats.isDirectory()) {

			this.fs.readdir(filePath, bind(function(error, files) {

				if (error) {
					response.writeHead(500, {});
					response.end();
					return;
				}

				var l = pathname.length;
				if (pathname.substring(l-1)!='/') pathname += '/';

				response.writeHead(200, {'Content-Type': 'text/html'});
				response.write('<!DOCTYPE html>\n<html><head><meta charset="UTF-8"><title>' + filePath + '</title></head><body>');
				response.write('<h1>' + filePath + '</h1>');
				response.write('<ul style="list-style:none;font-family:courier new;">');
				files.unshift('.', '..');
				files.forEach(function(item) {

					var urlpath = pathname + item,
						itemStats = this.fs.statSync(this.currentDir + urlpath);

					if (itemStats.isDirectory()) {
						urlpath += '/';
						item += '/';
					}

					response.write('<li><a href="'+ urlpath + '">' + item + '</a></li>');
				});

				response.end('</ul></body></html>');
			}, this));
		}
	}, this));
}

module.exports = new Server();
