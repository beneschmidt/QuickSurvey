sap.ui.controller("quicksurvey.view.ChangeSurvey", {

	/**
	* Called when a controller is instantiated and its View controls (if available) are already created.
	* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	* @memberOf view.NewFeatures-v122
	*/
	onInit: function() {
		jQuery.sap.require("sap.ui.model.json.JSONModel");

		//this.getView().setModel(new sap.ui.model.json.JSONModel("model/coffee.json"), "coffee");
		this.bus = sap.ui.getCore().getEventBus();
		this.bus.subscribe("nav", "to", this.navHandler, this);
	},

	navHandler: function(channelId, eventId, data){
		if (eventId === "to" && data.id==="ChangeSurvey") {
			console.log("SurveyId: "+data.surveyId)
			this.loadData(data.surveyId);
		}
	},

	loadData: function(id){
		var that= this;
		console.log("load data...");

		$.ajax({
			url: './survey',
			type: 'get',
			//	contentType: "application/json; charset=utf-8",
			success: function (data) {
				that.updateModel(JSON.parse(data));
			},
			error: function(jqXHR, textStatus, errorThrown) {
				if(jqXHR.readyState === 0){
					console.log("Server unreachable");
				} else {
					console.log("An unknown error occured: "+textStatus);
				}
			},
			data: { id: id }
		});
	},

	updateModel: function(json){
		console.log(json);
		var survey = json.Survey[0];

		var input = {
			title   : survey.name,
			answersChangable   : survey.changeanswers,
			surveyId: survey.objectId
		};

		var model = new sap.ui.model.json.JSONModel(input);
		sap.ui.getCore().setModel(model, "input");
		this.getView().setModel(model, "input");
	},

	doNavBack: function(event) {
		this.bus.publish("nav", "back");
	},

	updateSurvey: function(event){
		var controller = this;
		var model = this.getView().getModel("input");
		console.log(model);
		var that= this;
		var survey = {
			name : model.getProperty("/title"),
			answersChangable : model.getProperty("/answersChangable"),
			surveyId: model.getProperty("/surveyId")
		};

		$.ajax({
			url: './updateSurvey',
			type: 'post',
			//	contentType: "application/json; charset=utf-8",
			success: function (data) {
				console.log("updated");
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

				sap.ui.getCore().getEventBus().publish("nav", "to", {
					id : "SurveyList"
				});
			},
			data: { survey: survey }
		});
	},

	deleteSurvey: function(event){
		var model = this.getView().getModel("input");
		var that= this;
		var survey = {
			name : model.getProperty("/title"),
			answersChangable : model.getProperty("/answersChangable"),
			surveyId: model.getProperty("/surveyId")
		}

		$.ajax({
			url: './deleteSurvey',
			type: 'post',
			//	contentType: "application/json; charset=utf-8",
			success: function (data) {
				console.log("deleted");
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
				sap.ui.getCore().getEventBus().publish("nav", "to", {
					id : "SurveyList"
				});
			},
			data: { survey: survey }
		});
	},

});
