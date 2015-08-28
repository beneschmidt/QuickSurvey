module.exports = {
	result : null,
	log : null,
	pg : null,
	http : null,
	fs : null,
	first: true,

	getSurveyList : function(res, req, http, log){
		this.log = log;
		this.http = http;
		var that = this;

		var http = require('http');
		var pg = require('pg');

		var conString = "postgres://quicksurvey:quicksurvey@localhost:5432/quicksurvey";
		var oClient = new pg.Client(conString);
		var table = "view_full_surveys";
		var constraint;
		this.result = [];
		var dbutils = require("./dbutils.js");

		oClient.connect(function(err) {
			if(err) {
				return that.log.error('could not connect to postgres', err);
			}
			oClient.query('BEGIN', function(err, result) {
				if(err) {
					that.log.error("BEGIN not working...");
					return that.rollbackDB(oClient);
				}
				var select = 'SELECT * FROM '+table;
				if(constraint){
					select += ' ' +constraint;
				}
				var insertQuery = oClient.query(select);
				insertQuery.on('row', function(row) {
					that.result.push(row);
				});
				insertQuery.on('end', function(result) {
					if(result.rowCount===0){
						that.log.info("no "+table+" received!");
						that.log.info(result);
						oClient.end();
					} else {
						var toSend = dbutils.extractFullSurveyList(that.result, that.log);
						that.log.info(toSend.Survey.length);

						res.setHeader("Access-Control-Allow-Origin", "*");
						res.writeHead(200, {'Content-Type': 'text/plain'});
						res.write(JSON.stringify(toSend) + "\n");
						res.end();
						oClient.end();
					}
				});
			});
		});
	},

	addNewSurvey : function(res, req, body, http, log){
		this.log = log;
		this.http = http;
		var that = this;
		this.fs = require('fs');
		// ALTERNATING FILES TO MAKE DIFFERENT RESULTS
		this.first = !this.first;
		var fileId = this.first?1:2;
		var fileName = 'model/survey'+fileId+'.json';

		var http = require('http');
		var pg = require('pg');

		var conString = "postgres://quicksurvey:quicksurvey@localhost:5432/quicksurvey";
		var oClient = new pg.Client(conString);
		var survey = "view_full_surveys";
		var constraint;
		this.result = [];
		var dbutils = require("./dbutils.js");

		oClient.connect(function(err) {
			if(err) {
				return that.log.error('could not connect to postgres', err);
			}
			oClient.query('BEGIN', function(err, result) {

				if(err) {
					that.log.error("BEGIN not working...");
					return that.rollbackDB(oClient);
				}
				var insert = "INSERT INTO survey (name, changeanswers) VALUES ('"+body.name+"', "+body.answersChangable+")";

				that.log.info(insert);
				var insertQuery = oClient.query(insert);
				insertQuery.on('row', function(row) {
					that.result.push(row);
				});
				insertQuery.on('end', function(result) {
					if(result.rowCount===0){
						that.log.info(result);
						oClient.end();
					} else {
						that.log.info(result);
						oClient.query('COMMIT', oClient.end.bind(oClient));
						// empty 200 OK response for now
						res.setHeader("Access-Control-Allow-Origin", "*");
						res.writeHead(200, "OK", {'Content-Type': 'text/html'});
						res.end();
					}
				});
			});
		});
	},

	/*this.fs.readFile(fileName, 'utf8', function (err,data) {
	if (err) {
	return console.log(err);
}
var json = JSON.parse(data);
res.setHeader("Access-Control-Allow-Origin", "http://localhost:8877");
log.info("write JSON: "+JSON.stringify(json));
res.writeHead(200, {'Content-Type': 'text/plain'});
res.write(JSON.stringify(json) + "\n");
res.end();
});*/

}
