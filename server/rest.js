module.exports = {
	result : null,
	log : null,
	pg : null,
	http : null,
	fs : null,
	first: true,

	getSurveyList : function(res, req, log){
		this.log = log;
		var that = this;

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

	getSurvey : function(req, res, log){
		this.log = log;
		var that = this;
		var objectId = req.query.id;

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
				var select = 'SELECT * FROM '+table + ' WHERE sid = '+objectId;
				log.info(select);
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

						res.writeHead(200, {'Content-Type': 'text/plain'});
						res.write(JSON.stringify(toSend) + "\n");
						res.end();
						oClient.end();
					}
				});
			});
		});
	},

	addNewSurvey : function(res, req, body, log){
		this.log = log;
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

				var insertQuery = oClient.query(insert);
				insertQuery.on('row', function(row) {
					that.result.push(row);
				});
				insertQuery.on('end', function(result) {
					if(result.rowCount===0){
						oClient.end();
					} else {
						oClient.query('COMMIT', oClient.end.bind(oClient));
						// empty 200 OK response for now
						res.writeHead(200, "OK", {'Content-Type': 'text/html'});
						res.end();
					}
				});
			});
		});
	},

	deleteSurvey : function(res, req, survey, log){
		this.log = log;
		var that = this;
		var http = require('http');
		var pg = require('pg');

		var conString = "postgres://quicksurvey:quicksurvey@localhost:5432/quicksurvey";
		var oClient = new pg.Client(conString);
		this.result = [];
		var dbutils = require("./dbutils.js");
		log.info("SURVEY TO DELETE: "+survey.surveyId);

		oClient.connect(function(err) {
			if(err) {
				return that.log.error('could not connect to postgres', err);
			}
			oClient.query('BEGIN', function(err, result) {
				if(err) {
					that.log.error("BEGIN not working...");
					return that.rollbackDB(oClient);
				};

				var del = "DELETE FROM survey WHERE id = "+survey.surveyId;
				var deleteQuery = oClient.query(del);
				deleteQuery.on('row', function(row) {
					that.result.push(row);
				});
				deleteQuery.on('end', function(result) {
					if(result.rowCount===0){
						oClient.end();
					} else {
						oClient.query('COMMIT', oClient.end.bind(oClient));
						// empty 200 OK response for now
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
