sap.ui.controller("quicksurvey.view.StartSurvey", {

	/**
	* Called when a controller is instantiated and its View controls (if available) are already created.
	* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	* @memberOf view.NewFeatures-v122
	*/
	onInit: function() {
		jQuery.sap.require("sap.ui.model.json.JSONModel");
		this.clearModel();

		this.bus = sap.ui.getCore().getEventBus();
		this.bus.subscribe("nav", "to", this.navHandler, this);
	},

	navHandler: function(channelId, eventId, data){
		if (eventId === "to" && data.id==="StartSurvey") {
			this.getView().getModel("startSurvey").setProperty("/survey_id", data.surveyId);
		}
	},

	clearModel: function(){
		var startSurvey = {
			survey_id   : "",
			startedat : 0,
			autostop : false,
			minutes : 1
		};

		var model = new sap.ui.model.json.JSONModel(startSurvey);
		this.getView().setModel(model, "startSurvey");
	},

	doNavBack: function(event) {
		this.bus.publish("nav", "back");
	},

	startSurvey: function(event){
		var controller = this;
		var model = this.getView().getModel("startSurvey");
		var that= this;
		var startedat = new Date().getTime();
		var finishat = model.getProperty("/autostop") ? startedat+(model.getProperty("/minutes")*1000*60) : -1;
		var survey = {
			survey_id : model.getProperty("/survey_id"),
			startedat : startedat,
			finishat : finishat
		};

		$.ajax({
			url: './StartSurvey',
			type: 'post',
			//	contentType: "application/json; charset=utf-8",
			success: function (data) {
				sap.ui.getCore().getEventBus().publish("nav", "to", {
					id : "SurveyList"
				});
			},
			error: function(jqXHR, textStatus, errorThrown) {
				if(jqXHR.readyState === 0){
					console.log("Server unreachable");
				} else {
					console.log("An unknown error occured: "+textStatus);
				}
				controller.clearModel();
				sap.ui.getCore().getEventBus().publish("nav", "to", {
					id : "SurveyList"
				});
			},
			data: { survey: survey }
		});
	}
});
