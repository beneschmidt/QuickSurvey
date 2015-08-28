var http = require("http");
var Logger = require('basic-logger');
var port = 5433;
var host = 'localhost';

// CORS
var express = require('express')
  , cors = require('cors')
  , app = express();

app.use(cors());

app.get('/products/:id', function(req, res, next){
  res.json({msg: 'This is CORS-enabled for all origins!'});
});

app.listen(80, function(){
  console.log('CORS-enabled web server listening on port 80');
});


// config
var customConfig = {
  showMillis: true,
  showTimestamp: true
};


var log = new Logger(customConfig) // custom config parameters will be used, defaults will be used for the other parameters
var rest = require("./rest.js");
var that = this;
var url = require( "url" );
var queryString = require( "querystring" );

http.createServer(function(req, res) {
  if(req.method == 'GET') {
    var splittedPath = req.url.substr(1).split("/");
    var firstSubpath = splittedPath[0];
    log.info("GET request received: "+firstSubpath);
    if(firstSubpath==="surveyList"){
      rest.getSurveyList(res, req, http, log);
    } else {
      log.info("no such subpath: "+firstSubpath);
    }
  } else if(req.method == 'POST'){
    console.log("Post incoming!");

    var body="";
    req.on('data', function(chunk) {
      console.log("Received body data:");
      console.log(chunk.toString());
      body+= chunk.toString();
    });
    req.on('end', function() {
      console.log("UNPARSED: "+body);
      console.log("MY BODY:" +JSON.parse(body));
      var data = JSON.parse(body).survey;

      var splittedPath = req.url.substr(1).split("/");
      var firstSubpath = splittedPath[0];
      log.info("POST request received: "+firstSubpath);
      if(firstSubpath==="addNewSurvey"){
        rest.addNewSurvey(res, req, data, http, log);
      } else {
        log.info("no such subpath: "+firstSubpath);
      }
    });
  }
}).listen(port,host);
log.info("##### Connected to " + port + "   " + host + " #####");
