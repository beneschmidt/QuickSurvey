var http = require("http");
var Logger = require('basic-logger');
var port = 5433;
var host = 'localhost';

var customConfig = {
    showMillis: true,
    showTimestamp: true
};


var log = new Logger(customConfig) // custom config parameters will be used, defaults will be used for the other parameters
var rest = require("./rest.js"); 
var that = this;

http.createServer(function(req, res) {
	if(req.method == 'GET') {
		var splittedPath = req.url.substr(1).split("/");
		var firstSubpath = splittedPath[0];
		log.info("GET request received: "+firstSubpath);
		console.log("no such firstSubpath");			
	}
}).listen(port,host);
log.info("##### Connected to " + port + "   " + host + " #####");
