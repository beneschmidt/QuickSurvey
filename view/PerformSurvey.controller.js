sap.ui.controller("quicksurvey.view.PerformSurvey", {

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
		if (eventId === "to" && data.id==="PerformSurvey") {
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
			var canGoBack = this.getView().getModel("survey").getProperty("/answersChangable")? currentCounter > 0 && currentCounter <= numberOfQuestions-1: false;
			var oBtnPrevious = new sap.m.Button({
				icon : "sap-icon://arrow-left",
				tooltip : "previous page",
				visible : canGoBack,
				press : function(ev) {
					oController.getView().previousView();
				}
			});
			footerArrayLeft.push(oBtnPrevious);
			var oBtnHome = new sap.m.Button({
				icon : "sap-icon://home",
				tooltip : "home",
				visible: currentCounter === numberOfQuestions,
				press : function(ev) {
					sap.ui.getCore().getEventBus().publish("nav", "to", {
						id : "Launchpad"
					});
				}
			});
			footerArrayRight.push(oBtnHome);
			// show next button only if something was selected
			var oBtnNext = new sap.m.Button({
				icon : "sap-icon://arrow-right",
				tooltip : "next page",
				press : function(ev) {
					oController.getView().nextView();
				}
			});
			oBtnNext.bindProperty("visible", "perform>/performed_questions/"+currentCounter+"/performed_answers", function(answers){
				var hasAlreadySelectedSomething = answers? answers.length>0:false;
				return currentCounter < numberOfQuestions-1 && hasAlreadySelectedSomething;
			});
			footerArrayRight.push(oBtnNext);
			var oBtnNew = new sap.m.Button({
				icon : "sap-icon://save",
				visible : currentCounter === numberOfQuestions-1,
				tooltip : "Save",
				press : function(ev) {
					var answers = oController.getView().getModel("perform").getProperty("/performed_questions/"+currentCounter+"/performed_answers");
					var hasAlreadySelectedSomething = answers? answers.length>0:false;
					if(hasAlreadySelectedSomething){
						oController.sendSurveyInfos();
					} else {
						oController.openNothingSelectedDialog();
					}
				}
			});
			footerArrayRight.push(oBtnNew);
			var oLblCount = new sap.m.Label({
				text : (currentCounter+1) + " of " + numberOfQuestions,
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

	openNothingSelectedDialog : function(){
		var dialog = new sap.m.Dialog({
			title: "nothing selected",
			type: sap.m.DialogType.Message,
			state: sap.ui.core.ValueState.Warning,
			content: [new sap.m.Text({
				text: "Please select an answer before sending the survey. Thanks",
				textAlign: sap.ui.core.TextAlign.Center
			})]
		})
		var button = new sap.m.Button({
			text: "OK",
			press: function(oControlEvent){
				dialog.close();
			}
		});
		dialog.setEndButton(button);
		dialog.open();
	},

	loadData: function(id){
		var that= this;

		$.ajax({
			url: './survey',
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

			var perform = {
				survey_id   : model.getProperty("/surveyId"),
				performed_at : 0,
				performed_questions: []
			};
			for(var i = 0; i < model.getProperty("/questions").length; i++){
				var question = {
					question_id : model.getProperty("/questions/"+i+"/objectId"),
					performed_answers:[]
				};
				perform.performed_questions.push(question);
			}

			var model = new sap.ui.model.json.JSONModel(perform);
			this.getView().setModel(model, "perform");
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

	sendSurveyInfos: function(event){
		var controller = this;
		var model = this.getView().getModel("perform");
		var that= this;
		var survey = {
			survey_id : model.getProperty("/survey_id"),
			performed_at : new Date().getTime(),
			performed_questions: model.getProperty("/performed_questions")
		};

		$.ajax({
			url: './performSurvey',
			type: 'post',
			//	contentType: "application/json; charset=utf-8",
			success: function (data) {
				var data =JSON.parse(data);
				that.getView().getModel("info").setProperty("/alreadyFinished", !data.ok);
				that.getView().nextView();
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
	},

});
