sap.ui.controller("quicksurvey.view.AnalyseSurvey", {

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
		if (eventId === "to" && data.id==="AnalyseSurvey") {
			if(data.isNew){
				this.clearModel();
			}
			if(data.surveyId){
				this.loadData(data.surveyId);
			} else {
				this.updatePage();
			}
		}
	},

	updatePage: function(){
		if(this.getView().page){
			// update content
			this.getView().page.removeAllContent();
			var form = this.getView().getCurrentForm();
			this.getView().page.addContent(form);

			var oController = this;
			var footerArrayRight = [], footerArrayLeft=[], footerArrayMiddle=[];

			var currentCounter = this.getView().getCurrentCounter();
			var numberOfQuestions = this.getView().getModel("survey").getProperty("/questions").length;
			var oBtnPrevious = new sap.m.Button({
				icon : "sap-icon://arrow-left",
				tooltip : "previous page",
				visible : currentCounter>0,
				press : function(ev) {
					oController.getView().previousView();
				}
			});
			footerArrayLeft.push(oBtnPrevious);
			var oBtnNext = new sap.m.Button({
				icon : "sap-icon://arrow-right",
				tooltip : "next page",
				visible: currentCounter < numberOfQuestions-1,
				press : function(ev) {
					oController.getView().nextView();
				}
			});
			footerArrayRight.push(oBtnNext);
			var oLblCount = new sap.m.Label({
				text : (currentCounter+1) + " of " + numberOfQuestions,
				visible : currentCounter>=0
			});
			footerArrayMiddle.push(oLblCount);
			var bar = new sap.m.Bar({
				contentRight: footerArrayRight,
				contentMiddle: footerArrayMiddle,
				contentLeft: footerArrayLeft
			});

			this.getView().page.setFooter(bar);
		}
	},

	loadData: function(id){
		var that= this;

		$.ajax({
			url: './surveyAnalysis',
			type: 'get',
			//	contentType: "application/json; charset=utf-8",
			success: function (data) {
				that.updateModelFromAjax(JSON.parse(data));
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

	updateModelFromAjax: function(json){
		var survey = json.Survey[0];
		if(survey){
			var input = {
				title   : survey.name,
				answersChangable : survey.changeanswers,
				surveyId: survey.objectId,
				questions: survey.questions
			};
			if(survey.startedat && new Date().getTime() > survey.startedat){
				if(survey.finishat && survey.finishat!=-1 && new Date().getTime() > survey.finishat){
					this.getView().getModel("info").setProperty("/finished", true);
				}
			} else {
				this.getView().getModel("info").setProperty("/notStarted", true);
			}

			var model = new sap.ui.model.json.JSONModel(input);
			this.getView().setModel(model, "survey");
		} else {
			this.getView().getModel("info").setProperty("/notExisting", true);
		}

		this.updatePage();
	},

	clearModel: function(){
		var perform = {
			survey_id   : "",
			performed_at : 0,
			performed_questions: []
		};

		var model = new sap.ui.model.json.JSONModel(perform);
		this.getView().setModel(model, "perform");

		var info = {
			counter: 0,
			alreadyFinished: false,
		}

		var infoModel = new sap.ui.model.json.JSONModel(info);
		this.getView().setModel(infoModel, "info");
	},

	doNavBack: function(event) {
		this.bus.publish("nav", "back");
	},

});
