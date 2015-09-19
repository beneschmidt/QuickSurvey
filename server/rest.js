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
		var that = this;
		var callback = function(result, error){
			if(error){
				log.info("not fine");
				that.write500();
			} else {
				var dbutils = require("./dbutils.js");
				var toSend = dbutils.extractFullSurveyList(result, log);
				log.info("fine");
				that.write200(res, toSend);
			}
		}
		dbutils.executeSelectSQL(sql, [], log, callback);
	},

	getSurvey : function(req, res, log){
		var dbutils = require("./dbutils.js");
		var params = [req.query.id];
		var sql = "SELECT * FROM view_full_surveys WHERE sid = $1";
		log.info("requesting Survey with id "+req.query.id);
		var that = this;
		var callback = function(result, error){
			if(error){
				write500(res);
			} else {
				var toSend = dbutils.extractFullSurveyList(result, log);
				that.write200(res, toSend);
			}
		}
		dbutils.executeSelectSQL(sql, params, log, callback);
	},

	write500:function(res){
		res.writeHead(500, "not okay", {'Content-Type': 'text/html'});
		res.end();
	},

	write200:function(res, toSend){
		res.writeHead(200, "OK", {'Content-Type': 'text/html'});
		if(toSend){
			res.write(JSON.stringify(toSend) + "\n");
		}
		res.end();
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

	getPerformMaxIds:function(callback, log){
		var dbutils = require("./dbutils.js");
		var sql = "SELECT MAX(s.id) AS sid, MAX(q.id) AS qid, MAX(a.id) AS aid FROM performed_survey s, performed_question q, performed_answer a";
		var idCallback = function(result){
			callback(result[0]);
		}
		dbutils.executeSelectSQL(sql, [], log, idCallback);
	},

	addOrUpdateSurvey : function(res, req, body, log){
		var dbutils = require("./dbutils.js");
		var that = this;
		var nextSurveyCallback = function(object){
			log.info("maxIds = "+object.sid+", "+object.qid+", "+object.aid);
			var nextSid = object.sid+1;
			var nextQid = object.qid+1;
			var nextAid = object.aid+1;
			var paramsArray = [];
			var sqlArray =[];
			if(body.surveyId){
				var deleteSurveyParams = [body.surveyId];
				var deleteSurvey = "DELETE FROM survey WHERE id = $1;";
				sqlArray.push(deleteSurvey);
				paramsArray.push(deleteSurveyParams);
			}
			var updateSurveyParams = [nextSid, body.name, body.answersChangable];
			var updateSurvey = "INSERT INTO survey (id, name, changeanswers) VALUES ($1, $2, $3);";
			sqlArray.push(updateSurvey);
			paramsArray.push(updateSurveyParams);
			if(body.questions){
				log.info("yes, I have questions");
				for(var i = 0; i < body.questions.length; i++){
					var q = body.questions[i];
					var updateQuestion="INSERT INTO question (id, questiontext, multiple, type, survey_id) VALUES ($1, $2, $3, $4, $5);";
					log.info("Question: "+q.questiontext);
					sqlArray.push(updateQuestion);
					var questionParams = [nextQid, q.questiontext, q.multiple,q.type, nextSid];
					paramsArray.push(questionParams);
					for(var j = 0; j < q.answers.length; j++){
						var a = q.answers[j];
						var updateAnswer="INSERT INTO possible_answer (id, answertext, question_id) VALUES ($1, $2, $3);";
						sqlArray.push(updateAnswer);
						var answerParams = [nextAid, a.answertext, nextQid];
						paramsArray.push(answerParams);
						nextAid++;
					}
					nextQid++;
				}
			}
			var updateSurveyCallback = function(sqlOK){
				if(sqlOK){
					that.write200(res);
				} else {
					that.write500(res);
				}
			}
			dbutils.executeUpdateMultipleSQL(sqlArray, paramsArray, log, updateSurveyCallback);
		}
		this.getMaxIds(nextSurveyCallback, log);
	},

	performSurveyIfNotFinished: function(res, req, body, log){
		var dbutils = require("./dbutils.js");
		var that = this;
		var params = [body.survey_id];
		log.info(body.survey_id);
		var sql = "SELECT * FROM view_full_surveys WHERE sid = $1";
		var callback = function(result){
			var survey = dbutils.extractFullSurveyList(result, log).Survey[0];
			var finishat = survey.finishat;
			var a = new Date().getTime();
			if(finishat && (finishat ==-1 || a < finishat)){
				log.info("not finished: "+finishat);
				that.addSurveyPerform(res, req, body, log);
			} else {
				log.info("already finished: "+finishat);
				var toSend = {
					ok : false
				}
				that.write200(res, toSend);
			}
		}
		dbutils.executeSelectSQL(sql, params, log, callback);
	},

	addSurveyPerform : function(res, req, body, log){
		var dbutils = require("./dbutils.js");
		var that = this;
		var nextSurveyCallback = function(object){
			log.info("maxIds = "+object.sid+", "+object.qid+", "+object.aid);
			var nextSid = object.sid+1;
			var nextQid = object.qid+1;
			var nextAid = object.aid+1;
			log.info("maxIds = "+nextSid+", "+nextQid+", "+nextAid);
			var paramsArray = [];
			var sqlArray =[];
			var updateSurveyParams = [nextSid, body.survey_id, body.performed_at];
			var updateSurvey = "INSERT INTO performed_survey (id, survey_id, performed_at) VALUES ($1, $2, $3);";
			sqlArray.push(updateSurvey);
			paramsArray.push(updateSurveyParams);
			if(body.performed_questions){
				log.info("yes, I have questions");
				for(var i = 0; i < body.performed_questions.length; i++){
					var q = body.performed_questions[i];
					var updateQuestion="INSERT INTO performed_question (id, question_id, performed_survey_id) VALUES ($1, $2, $3);";
					log.info("Question: "+q.questiontext);
					sqlArray.push(updateQuestion);
					var questionParams = [nextQid, q.question_id, nextSid];
					paramsArray.push(questionParams);
					for(var j = 0; j < q.performed_answers.length; j++){
						var a = q.performed_answers[j];
						var updateAnswer="INSERT INTO performed_answer (id, answer_id, performed_question_id, freetext) VALUES ($1, $2, $3, $4);";
						sqlArray.push(updateAnswer);
						var answerParams = [nextAid, a.answer_id, nextQid, a.freetext];
						paramsArray.push(answerParams);
						nextAid++;
					}
					nextQid++;
				}
			}
			var performSurveyCallback = function(sqlOK){
				if(sqlOK){
					var toSend = {
						ok : true
					}
					that.write200(res, toSend);
				} else {
					that.write500(res);
				}
			}
			dbutils.executeUpdateMultipleSQL(sqlArray, paramsArray, log, performSurveyCallback);
		}
		this.getPerformMaxIds(nextSurveyCallback, log);
	},


	deleteSurvey : function(res, req, survey, log){
		var dbutils = require("./dbutils.js");
		var params = [survey.surveyId];
		var sql = "DELETE FROM survey WHERE id = $1";
		var that = this;
		var callback = function(sqlOK){
			if(sqlOK){
				that.write200(res);
			} else {
				that.write500(res);
			}
		}
		dbutils.executeUpdateSQL(sql, params, log, callback);
	},

	startSurvey : function(res, req, survey, log){
		var dbutils = require("./dbutils.js");
		var params = [survey.survey_id, survey.startedat, survey.finishat];
		var sql = "UPDATE survey SET startedat = $2, finishat = $3 WHERE id = $1";
		var that = this;
		var callback = function(sqlOK){
			if(sqlOK){
				that.write200(res);
			} else {
				that.write500(res);
			}
		}
		dbutils.executeUpdateSQL(sql, params, log, callback);
	},

	stopSurvey : function(res, req, survey, log){
		var dbutils = require("./dbutils.js");
		var time = new Date().getTime();
		log.info("stopping survey with new time: "+time+" AND id: "+survey.surveyId)
		var params = [survey.surveyId,  time];
		var sql = "UPDATE survey SET finishat = $2 WHERE id = $1";
		var that = this;
		var callback = function(sqlOK){
			if(sqlOK){
				that.write200(res);
			} else {
				that.write500(res);
			}
		}
		dbutils.executeUpdateSQL(sql, params, log, callback);
	},
}
