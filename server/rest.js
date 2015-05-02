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
		this.fs = require('fs');
		// ALTERNATING FILES TO MAKE DIFFERENT RESULTS
		this.first = !this.first;
		var fileId = this.first?1:2;
		var fileName = 'model/survey'+fileId+'.json';
		
		this.fs.readFile(fileName, 'utf8', function (err,data) {
			if (err) {
				return console.log(err);
			}
			var json = JSON.parse(data);
			res.setHeader("Access-Control-Allow-Origin", "http://localhost:8877");
			log.info("write JSON: "+JSON.stringify(json));
			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.write(JSON.stringify(json) + "\n");
			res.end();
		});
		
		
	},
	
	/*
	returnSQLResult : function(res, req, http, log, table, constraint){
		this.log = log;
		this.http = http;
		var that = this;
		this.result = [];
		var conString = "pg://thresh:thresh@localhost:5432/threshDB";
		var pg = require("pg");
		var oClient = new pg.Client(conString);

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
				var selectQuery = oClient.query(select);
				selectQuery.on('row', function(row) {
					that.result.push(row);
				});
				selectQuery.on('end', function(result) {
					if(result.rowCount===0){
						that.log.info("no "+table+" received!")	
						oClient.end();				
					} else {
					    res.setHeader("Access-Control-Allow-Origin", "http://localhost:9001");
						res.writeHead(200, {'Content-Type': 'text/plain'});
						res.write(JSON.stringify(that.result) + "\n");
						res.end();
						oClient.end();
					}
				})
				selectQuery.on('error', function(err) {
					that.log.error(err + " cannot receive "+table);
					oClient.query('ROLLBACK', function() {
						oClient.end();
					});
				});
			});
		});
	}*/
}