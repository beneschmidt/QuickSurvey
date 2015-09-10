module.exports = {
	result : null,
	log : null,
	pg : null,
	http : null,
	fs : null,
	first: true,

	getSurveyList : function(res, req, log){
		var dbutils = require("./dbutils.js");
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
		dbutils.executeSelectSQL(sql, [], log, callback);
	},

	getSurvey : function(req, res, log){
		var dbutils = require("./dbutils.js");
		var params = [req.query.id];
		var sql = "SELECT * FROM view_full_surveys WHERE sid = $1";
		var callback = function(result, error){
			if(error){
				res.writeHead(500, "not okay", {'Content-Type': 'text/html'});
				res.end();
			} else {
				var toSend = dbutils.extractFullSurveyList(result, log);
				log.info(toSend.Survey.length);
				res.writeHead(200, "OK", {'Content-Type': 'text/html'});
				res.write(JSON.stringify(toSend) + "\n");
				res.end();
			}
		}
		dbutils.executeSelectSQL(sql, params, log, callback);
	},

	getNextSurveyId : function(callback, log){
		var dbutils = require("./dbutils.js");
		var surveyCallback = function(id){
			callback(id);
		}
		dbutils.getNextId(surveyCallback, "survey", log);
	},

	getMaxIds:function(callback, log){
		var dbutils = require("./dbutils.js");
		var sql = "SELECT MAX(sid) AS sid, MAX(qid) AS qid, MAX(aid) AS aid FROM view_full_surveys";
		var idCallback = function(result){
			callback(result[0]);
		}
		dbutils.executeSelectSQL(sql, [], log, idCallback);
	},


	addQuestionInsert: function(startInt, question){
		return  "INSERT INTO question (id, questiontext, mutliple, survey_id) VALUES ($"+startInt+", $"+(startInt+1)+", $"+(startInt+2)+", $"+(startInt+3)+");";
	},

	addNewSurvey : function(res, req, body, log){
		var dbutils = require("./dbutils.js");
		var that = this;
		var nextSurveyCallback = function(object){
			log.info("maxIds = "+object.sid+", "+object.qid+", "+object.aid);
			var nextSid = object.sid+1;
			var nextQid = object.qid+1;
			var nextAid = object.aid+1;
			var paramsArray = [];
			var sqlArray =[];
			var insertSurveyParams = [nextSid, body.name, body.answersChangable];
			var insertSurvey = "INSERT INTO survey (id, name, changeanswers) VALUES ($1, $2, $3);";
			sqlArray.push(insertSurvey);
			paramsArray.push(insertSurveyParams);
			if(body.questions){
				log.info("yes, I have questions");
				for(var i = 0; i < body.questions.length; i++){
					var next = i*3 + 3;
					var q = body.questions[i];
					var insertQuestion="INSERT INTO question (id, questiontext, multiple, type, survey_id) VALUES ($1, $2, $3, $4, $5);";
					sqlArray.push(insertQuestion);
					var questionParams = [nextQid, q.questiontext, q.multiple,q.type, nextSid];
					paramsArray.push(questionParams);
				}
			}
			var insertSurveyCallback = function(sqlOK){
				if(sqlOK){
					//this.executeUpdateSQL(sql, params, log, callback);
					res.writeHead(200, "OK", {'Content-Type': 'text/html'});
					res.end();
				} else {
					log.error("Error at inserting multiple stuff: "+sqlOK);
					res.writeHead(500, "not okay", {'Content-Type': 'text/html'});
					res.end();
				}
			}
			dbutils.executeUpdateMultipleSQL(sqlArray, paramsArray, log, insertSurveyCallback);
		}
		this.getMaxIds(nextSurveyCallback, log);
	},

	updateSurvey : function(res, req, body, log){
		var dbutils = require("./dbutils.js");
		var params = [body.surveyId, body.name, body.answersChangable];
		var sql = "UPDATE survey SET name = $2, changeanswers= $3   WHERE id = $1";
		var callback = function(sqlOK){
			if(sqlOK){
				res.writeHead(200, "OK", {'Content-Type': 'text/html'});
				res.end();
			} else {
				res.writeHead(500, "not okay", {'Content-Type': 'text/html'});
				res.end();
			}
		}
		dbutils.executeUpdateSQL(sql, params, log, callback);
	},

	deleteSurvey : function(res, req, survey, log){
		var dbutils = require("./dbutils.js");
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
		dbutils.executeUpdateSQL(sql, params, log, callback);
	},
}
