
module.exports = {
	init : function(app){
		var Logger = require('basic-logger');
		var log = new Logger(customConfig);
		var customConfig = {
			showMillis: true,
			showTimestamp: true
		};
		var log = new Logger(customConfig)
		var rest = require("./rest.js");
		app.get("/QuickSurvey/surveyList", function(req, res){
			rest.getSurveyList(res, req, log);
		});
		app.get("/QuickSurvey/survey", function(req, res){
			log.info("SurveyId: "+req.query.id)
			rest.getSurvey(req, res, log);
		});
		app.post("/QuickSurvey/addNewSurvey", function(req, res){
			log.info("Adding a new survey...");
      rest.addOrUpdateSurvey(res, req, req.body.survey, log);
		});
		app.post("/QuickSurvey/updateSurvey", function(req, res){
			log.info("Updating survey...");
      rest.addOrUpdateSurvey(res, req, req.body.survey, log);
		});
		app.post("/QuickSurvey/deleteSurvey", function(req, res){
			log.info("Deleting survey...");
      rest.deleteSurvey(res, req, req.body.survey, log);
		});
		app.post("/QuickSurvey/performSurvey", function(req, res){
			log.info("performing survey...");
      rest.performSurveyIfNotFinished(res, req, req.body.survey, log);
		});
		app.post("/QuickSurvey/startSurvey", function(req, res){
			log.info("starting survey...");
      rest.startSurvey(res, req, req.body.survey, log);
		});
		app.post("/QuickSurvey/stopSurvey", function(req, res){
			log.info("stopping survey...");
      rest.stopSurvey(res, req, req.body.survey, log);
		});

	}
}
