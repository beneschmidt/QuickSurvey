// Usage see http://scn.sap.com/community/developer-center/front-end/blog/2014/01/05/sapui5-sdk-on-nodejs
var express = require('express'),
	open = require('open');
	port = 8877,
	sapui5 = '/QuickSurvey'
	url = 'http://localhost:' + port + sapui5,// + "/latest";
	year = 60 * 60 * 24 * 365 * 1000;
	app = express();


// Use compress middleware to gzip content
app.use(express.compress());
app.configure(function(){
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
});

//set default mime type to xml for ".library" files
express.static.mime.default_type = "text/xml";

// Serve up content directory showing hidden (leading dot) files
app.use(sapui5,express.static(__dirname, { maxAge: year, hidden: true }));
// enable directory listening
app.use(sapui5,express.directory(__dirname));

app.listen(port);

var rest_init = require("./server/rest_init.js");
rest_init.init(app);
console.log(url);
