
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
		app.post("/QuickSurvey/addNewSurvey", function(req, res){
			log.info("Adding a new survey...");
      rest.addNewSurvey(res, req, req.body.survey, log);
		})
	}
}
