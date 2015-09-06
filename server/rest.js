module.exports = {
	result : null,
	log : null,
	pg : null,
	http : null,
	fs : null,
	first: true,

	getSurveyList : function(res, req, log){
		var sql = "SELECT * FROM view_full_surveys";
		var callback = function(result, error){
			if(error){
				res.writeHead(500, "not okay", {'Content-Type': 'text/html'});
				res.end();
			} else {
				var dbutils = require("./dbutils.js");
				var toSend = dbutils.extractFullSurveyList(result, log);
				log.info(toSend.Survey.length);
				res.writeHead(200, "OK", {'Content-Type': 'text/html'});
				res.write(JSON.stringify(toSend) + "\n");
				res.end();
			}
		}
		this.executeSelectSQL(sql, [], log, callback);
	},

	getSurvey : function(req, res, log){
		var params = [req.query.id];
		var sql = "SELECT * FROM view_full_surveys WHERE sid = $1";
		var callback = function(result, error){
			if(error){
				res.writeHead(500, "not okay", {'Content-Type': 'text/html'});
				res.end();
			} else {
				var dbutils = require("./dbutils.js");
				var toSend = dbutils.extractFullSurveyList(result, log);
				log.info(toSend.Survey.length);
				res.writeHead(200, "OK", {'Content-Type': 'text/html'});
				res.write(JSON.stringify(toSend) + "\n");
				res.end();
			}
		}
		this.executeSelectSQL(sql, params, log, callback);
	},

	addNewSurvey : function(res, req, body, log){
		var params = [body.name, body.answersChangable];
		var sql = "INSERT INTO survey (name, changeanswers) VALUES ($1, $2)";
		var callback = function(sqlOK){
			if(sqlOK){
				res.writeHead(200, "OK", {'Content-Type': 'text/html'});
				res.end();
			} else {
				res.writeHead(500, "not okay", {'Content-Type': 'text/html'});
				res.end();
			}
		}
		this.executeUpdateSQL(sql, params, log, callback);
	},

	deleteSurvey : function(res, req, survey, log){
		var params = [survey.surveyId];
		var sql = "DELETE FROM survey WHERE id = $1";
		var callback = function(sqlOK){
			if(sqlOK){
				res.writeHead(200, "OK", {'Content-Type': 'text/html'});
				res.end();
			} else {
				// empty 200 OK response for now
				res.writeHead(500, "not okay", {'Content-Type': 'text/html'});
				res.end();
			}
		}
		this.executeUpdateSQL(sql, params, log, callback);
	},

	executeUpdateSQL : function(sql, params, log, callback){
		this.log = log;
		var that = this;
		var pg = require('pg');

		var conString = "postgres://quicksurvey:quicksurvey@localhost:5432/quicksurvey";
		var oClient = new pg.Client(conString);
		this.result = [];
		var dbutils = require("./dbutils.js");
		log.info("SQL to execute "+sql);
		this.callback = callback;

		pg.connect(conString, function(err, client, done) {

			var handleError = function(err) {
				// no error occurred, continue with the request
				if(!err) return false;
				that.log.error(err);

				// An error occurred, remove the client from the connection pool.
				// A truthy value passed to done will remove the connection from the pool
				// instead of simply returning it to be reused.
				// In this case, if we have successfully received a client (truthy)
				// then it will be removed from the pool.
				if(client){
					done(client);
				}

				return true;
			};


			// handle an error from the connection
			if(handleError(err)) {
				that.callback(false);
				return;
			};
			// record the visit
			client.query(sql, params, function(err, result) {
				// handle an error from the query
				if(handleError(err)) {
					that.callback(false);
					return;
				};
				// return the client to the connection pool for other requests to reuse
				done();
				that.callback(true);
				return;
			});
		});
	},

	executeSelectSQL: function(select, params, log, callback){
		this.log = log;
		this.callback = callback;
		var that = this;

		var pg = require('pg');

		var conString = "postgres://quicksurvey:quicksurvey@localhost:5432/quicksurvey";
		var oClient = new pg.Client(conString);
		var constraint;
		this.result = [];
		var dbutils = require("./dbutils.js");

		oClient.connect(function(err) {
			var handleError = function(err) {
				// no error occurred, continue with the request
				if(!err) return false;
				that.log.error(err);

				// An error occurred, remove the client from the connection pool.
				// A truthy value passed to done will remove the connection from the pool
				// instead of simply returning it to be reused.
				// In this case, if we have successfully received a client (truthy)
				// then it will be removed from the pool.
				if(client){
					done(client);
				}

				return true;
			};


			if(handleError(err)) {
				that.callback(null, error);
				return;
			};

			var query = oClient.query(select, params);
			query.on('row', function(row) {
				that.result.push(row);
				that.log.info("RESULT: "+that.result);
			});
			query.on('end', function(result) {
				if(result.rowCount===0){
					that.log.info("no "+table+" received!");
					that.log.info(result);
					that.callback();
					oClient.end();
				} else {
					that.log.info("RESULT: "+that.result);
					oClient.end();
					that.callback(that.result);
				}
			});
		});
	},
}
