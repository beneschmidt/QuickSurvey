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
		// callback for when the sql was executed
		var callback = function(result, error){
			if(error){
				that.write500(res);
			} else {
				// parse all rows into a survey object
				var toSend = dbutils.extractFullSurveyList(result, log);
				// if a fingerprint was given, check if it was already performed
				if(req.query.fingerprint){
					var fingerprintQuery = "SELECT COUNT(*) AS fcount FROM performed_survey WHERE survey_id = $1 AND fingerprint = $2";
					var fingerprintParams = [req.query.id, req.query.fingerprint];
					// callback for the fingerprint query
					var fingerprintCallback = function(result, error){
						if(error){
							that.write500(res);
						} else {
							log.info("alreadyPerformed? "+result[0].fcount);
							toSend.alreadyPerformed = result[0].fcount>0;
							that.write200(res, toSend);
						}
					}
					// execute the fingerprint check
					dbutils.executeSelectSQL(fingerprintQuery, fingerprintParams, log, fingerprintCallback);
				} else {
					// if no fingerprint was given, you can just return the survey
					that.write200(res, toSend);
				}
			}
		}
		// execute the sql with the created callback
		dbutils.executeSelectSQL(sql, params, log, callback);
	},

	getCopyOfSurvey : function(req, res, log){
		// create a copy of a survey by selecting all its values and killing the respective ids from the objects
		var dbutils = require("./dbutils.js");
		var params = [req.query.id];
		var sql = "SELECT * FROM view_full_surveys WHERE sid = $1";
		log.info("requesting Survey with id "+req.query.id);
		var that = this;
		// callback for the select
		var callback = function(result, error){
			if(error){
				write500(res);
			} else {
				// parse the rows into a survey
				var toSend = dbutils.extractFullSurveyList(result, log);
				var survey = toSend.Survey[0];

				// here's the fun part, just kill all object ids and additional information that
				// was added in later states of the object (dates for example)
				survey.objectId=undefined;
				survey.startedat=undefined;
				survey.finishat=undefined;
				for(var i = 0; i < survey.questions.length; i++){
					survey.questions[i].objectId=undefined;
					for(var j = 0; j < survey.questions[i].answers.length; j++){
						survey.questions[i].answers[j].objectId=undefined;
					}
				}
				that.write200(res, toSend);
			}
		}
		// execute the select
		dbutils.executeSelectSQL(sql, params, log, callback);
	},

	getSurveyAnalysisList : function(res, req, log){
		// get a full list of surveys with additional analysis information
		var dbutils = require("./dbutils.js");
		var params = [req.query.id];
		var sql = "SELECT * FROM view_survey_for_analysis WHERE sid = $1";
		log.info("requesting SurveyAnalysis with id "+req.query.id);
		var that = this;
		// callback for the select
		var callback = function(result, error){
			if(error){
				write500(res);
			} else {
				// parse all rows into a list of surveys
				var toSend = dbutils.extractFullSurveyList(result, log);
				that.write200(res, toSend);
			}
		}
		// execute the select
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

	getMaxIds:function(callback, log){
		// get the maximum ids of surveys, questions and answers, all at once
		var dbutils = require("./dbutils.js");
		var sql = "SELECT MAX(sid) AS sid, MAX(qid) AS qid, MAX(aid) AS aid FROM view_full_surveys";
		var idCallback = function(result){
			callback(result[0]);
		}
		dbutils.executeSelectSQL(sql, [], log, idCallback);
	},

	getPerformMaxIds:function(callback, log){
		// get the maximum ids of performed surveys, questions and answers, all at once
		var dbutils = require("./dbutils.js");
		var sql = "SELECT MAX(s.id) AS sid, MAX(q.id) AS qid, MAX(a.id) AS aid FROM performed_survey s, performed_question q, performed_answer a";
		var idCallback = function(result){
			callback(result[0]);
		}
		dbutils.executeSelectSQL(sql, [], log, idCallback);
	},

	addOrUpdateSurvey : function(res, req, body, log){
		// add or update a survey. It's kind of the same algorithm, with the difference that on an update
		// you just delete the existing survey first
		var dbutils = require("./dbutils.js");
		var that = this;
		// callback for the max ids
		var nextSurveyCallback = function(object){
			log.info("maxIds = "+object.sid+", "+object.qid+", "+object.aid);
			var nextSid = object.sid+1;
			var nextQid = object.qid+1;
			var nextAid = object.aid+1;
			// this is the array where all sqls that need to be executed are collected
			var sqlArray =[];
			// every sql has its own parameter array. All those arrays are saved in this array here
			var paramsArray = [];
			// if a survey id was given, that means it is an update process
			// and you have to delete the survey first
			if(body.surveyId){
				var deleteSurveyParams = [body.surveyId];
				var deleteSurvey = "DELETE FROM survey WHERE id = $1;";
				sqlArray.push(deleteSurvey);
				paramsArray.push(deleteSurveyParams);
			}
			// first you have to insert the new survey
			var updateSurveyParams = [nextSid, body.name, body.answersChangable, body.fingerprint];
			var updateSurvey = "INSERT INTO survey (id, name, changeanswers, fingerprint) VALUES ($1, $2, $3, $4);";
			sqlArray.push(updateSurvey);
			paramsArray.push(updateSurveyParams);
			// if there are questions, they follow next
			if(body.questions){
				log.info("yes, I have questions");

				// of course you have to iterate over them, creating an sql with params for every entry
				for(var i = 0; i < body.questions.length; i++){
					var q = body.questions[i];
					var updateQuestion="INSERT INTO question (id, questiontext, multiple, type, survey_id) VALUES ($1, $2, $3, $4, $5);";
					log.info("Question: "+q.questiontext);
					sqlArray.push(updateQuestion);
					var questionParams = [nextQid, q.questiontext, q.multiple,q.type, nextSid];
					paramsArray.push(questionParams);

					// for every question, there might be answers, which are created for the specific question and its id
					for(var j = 0; j < q.answers.length; j++){
						var a = q.answers[j];
						var updateAnswer="INSERT INTO possible_answer (id, answertext, question_id) VALUES ($1, $2, $3);";
						sqlArray.push(updateAnswer);
						var answerParams = [nextAid, a.answertext, nextQid];
						paramsArray.push(answerParams);
						// after every possible answer that will be created, you have to increase the next id
						nextAid++;
					}
					// after every possible question that will be created, you have to increase the next id
					nextQid++;
				}
			}
			// callback for the huge insert chain
			var updateSurveyCallback = function(sqlOK){
				if(sqlOK){
					that.write200(res);
				} else {
					that.write500(res);
				}
			}
			// execute the insert chain
			dbutils.executeUpdateMultipleSQL(sqlArray, paramsArray, log, updateSurveyCallback);
		}
		// get all max ids
		this.getMaxIds(nextSurveyCallback, log);
	},

	performSurveyIfNotFinished: function(res, req, body, log) {
		// performs a survey if it is not finished
		// otherwise it won't be saved (security back end check so to speak)
		var dbutils = require("./dbutils.js");
		var that = this;
		var params = [body.survey_id];
		log.info(body.survey_id);
		var sql = "SELECT * FROM view_full_surveys WHERE sid = $1";
		// callback for the select
		var callback = function(result){
			// parse the rows into a survey
			var survey = dbutils.extractFullSurveyList(result, log).Survey[0];
			var finishat = survey.finishat;
			var a = new Date().getTime();
			// and check the finish time. if it is -1 (no automated finish time) or
			// if the current time is still lower than the finish time, than we're fine
			if(finishat && (finishat ==-1 || a < finishat)){
				log.info("not finished: "+finishat);
				that.addSurveyPerform(res, req, body, log);
			} else {
				// otherwise inform the user that it could not be performed
				log.info("already finished: "+finishat);
				var toSend = {
					ok : false
				}
				that.write200(res, toSend);
			}
		}
		// execute the survey finished check
		dbutils.executeSelectSQL(sql, params, log, callback);
	},

	addSurveyPerform : function(res, req, body, log){
		// perform a survey. This is again a complex insert
		var dbutils = require("./dbutils.js");
		var that = this;
		// callback for the maximum id check
		var nextSurveyCallback = function(object){
			log.info("maxIds = "+object.sid+", "+object.qid+", "+object.aid);
			var nextSid = object.sid+1;
			var nextQid = object.qid+1;
			var nextAid = object.aid+1;
			log.info("maxIds = "+nextSid+", "+nextQid+", "+nextAid);
			// inserts are collected here to iteratively execute them later on
			var sqlArray =[];
			// every insert may have parameters, which are saved as arrays in this array
			var paramsArray = [];

			// first of all insert the survey perform
			var updateSurveyParams = [nextSid, body.survey_id, body.performed_at, body.fingerprint];
			var updateSurvey = "INSERT INTO performed_survey (id, survey_id, performed_at, fingerprint) VALUES ($1, $2, $3, $4);";
			sqlArray.push(updateSurvey);
			paramsArray.push(updateSurveyParams);

			// if questions were performed, they are next
			if(body.performed_questions){
				log.info("yes, I have questions");
				// of course you have to iterate over them, creating an insert sql for every one of it
				for(var i = 0; i < body.performed_questions.length; i++){
					var q = body.performed_questions[i];
					var updateQuestion="INSERT INTO performed_question (id, question_id, performed_survey_id) VALUES ($1, $2, $3);";
					log.info("Question: "+q.questiontext);
					sqlArray.push(updateQuestion);
					var questionParams = [nextQid, q.question_id, nextSid];
					paramsArray.push(questionParams);

					// the performed answers of a question are inserted between the current and the next question
					for(var j = 0; j < q.performed_answers.length; j++){
						var a = q.performed_answers[j];
						var updateAnswer="INSERT INTO performed_answer (id, answer_id, performed_question_id, freetext) VALUES ($1, $2, $3, $4);";
						sqlArray.push(updateAnswer);
						var answerParams = [nextAid, a.answer_id, nextQid, a.freetext];
						paramsArray.push(answerParams);
						// after every performed answer you have to increase the next id
						nextAid++;
					}
					// after every performed question you have to increase the next id
					nextQid++;
				}
			}
			// callback for the chained inserts
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
			// execute the chained inserts
			dbutils.executeUpdateMultipleSQL(sqlArray, paramsArray, log, performSurveyCallback);
		}
		// check the maximum ids for performed surveys
		this.getPerformMaxIds(nextSurveyCallback, log);
	},


	deleteSurvey : function(res, req, survey, log){
		// delete a survey
		var dbutils = require("./dbutils.js");
		var params = [survey.surveyId];
		var sql = "DELETE FROM survey WHERE id = $1";
		var that = this;
		// callback for the deletion
		var callback = function(sqlOK){
			if(sqlOK){
				that.write200(res);
			} else {
				that.write500(res);
			}
		}
		// execute the delete statement
		dbutils.executeUpdateSQL(sql, params, log, callback);
	},

	startSurvey : function(res, req, survey, log){
		// start a survey
		var dbutils = require("./dbutils.js");
		var params = [survey.survey_id, survey.startedat, survey.finishat];
		// if you start a survey, you have a start time and a finish time, which may be -1
		// if it won't automatically stop
		var sql = "UPDATE survey SET startedat = $2, finishat = $3 WHERE id = $1";
		var that = this;
		// callback for the start sql
		var callback = function(sqlOK){
			if(sqlOK){
				that.write200(res);
			} else {
				that.write500(res);
			}
		}
		// execute the update
		dbutils.executeUpdateSQL(sql, params, log, callback);
	},

	stopSurvey : function(res, req, survey, log){
		// stop a survey
		var dbutils = require("./dbutils.js");
		var time = new Date().getTime();
		log.info("stopping survey with new time: "+time+" AND id: "+survey.surveyId)
		var params = [survey.surveyId,  time];
		// it is actually just updating the finish time
		var sql = "UPDATE survey SET finishat = $2 WHERE id = $1";
		var that = this;
		// callback for the update
		var callback = function(sqlOK){
			if(sqlOK){
				that.write200(res);
			} else {
				that.write500(res);
			}
		}
		// execute the stop sql
		dbutils.executeUpdateSQL(sql, params, log, callback);
	},
}
