sap.ui.controller("quicksurvey.view.AddSurvey", {

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
		if (eventId === "to" && data.id==="AddSurvey") {
			if(data.isNew){
				this.clearModel();
			}
			if(data.copyOfSurvey){
				this.getView().getModel("info").setProperty("/copyOfSurvey", true);
			}
			if(data.surveyId){
				this.getView().getModel("info").setProperty("/update", true);
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
			var selectCombo = this.getView().createSelectDialogCombo();
			form.addContent(selectCombo.label);
			form.addContent(selectCombo.button);
			this.getView().page.addContent(form);

			var oController = this;
			var footerArrayRight = [], footerArrayLeft=[], footerArrayMiddle=[];

			var currentCounter = this.getView().getCurrentCounter();
			var numberOfQuestions = this.getView().getModel("survey").getProperty("/questions").length;
			var oBtnPrevious = new sap.m.Button({
				icon : "sap-icon://arrow-left",
				tooltip : "{i18n>PREVIOUS_PAGE}",
				visible : currentCounter>=0,
				press : function(ev) {
					oController.getView().previousView();
				}
			});
			footerArrayLeft.push(oBtnPrevious);
			var oBtnClearQuestion = new sap.m.Button({
				icon : "sap-icon://sys-cancel-2",
				visible : currentCounter>=0,
				tooltip : "{i18n>CLEAR_QUESTION}",
				press : function(ev) {
					oController.clearQuestion();
				}
			});
			footerArrayRight.push(oBtnClearQuestion);
			var oBtnDelete = new sap.m.Button({
				icon : "sap-icon://delete",
				visible : oController.getView().getModel("info").getProperty("/update"),
				tooltip : "{i18n>DELETE_SURVEY}",
				press : function(ev) {
					oController.deleteSurvey();
				}
			});
			footerArrayRight.push(oBtnDelete);
			var oBtnNew = new sap.m.Button({
				icon : "sap-icon://save",
				tooltip : "{i18n>SAVE}",
				press : function(ev) {
					if(oController.getView().getModel("info").getProperty("/update")){
						oController.updateSurvey();
					} else {
						oController.addSurvey();
					}
				}
			});
			footerArrayRight.push(oBtnNew);
			var oBtnNext = new sap.m.Button({
				icon : "sap-icon://arrow-right",
				tooltip : "{i18n>NEXT_PAGE}",
				enabled: currentCounter < numberOfQuestions-1,
				press : function(ev) {
					oController.getView().nextView();
				}
			});
			footerArrayRight.push(oBtnNext);
			var oLblCount = new sap.m.Label({
				text : (currentCounter+1) + " {i18n>I18N_OF} " + numberOfQuestions,
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
		console.log("load data...");

		var url = "./survey";
		if(this.getView().getModel("info").getProperty("/copyOfSurvey")){
			url = "./copyOfSurvey";
		}
		$.ajax({
			url: url,
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
		console.log("Found object...: "+json);
		var survey = json.Survey[0];

		var input = {
			title   : survey.name,
			answersChangable : survey.changeanswers,
			surveyId: survey.objectId,
			questions: survey.questions
		};

		var model = new sap.ui.model.json.JSONModel(input);
		this.getView().setModel(model, "survey");
		this.updatePage();
	},

	clearQuestion: function(){
		var currentCounter = this.getView().getCurrentCounter();
		var surveyModel = this.getView().getModel("survey");
		var currentArray = surveyModel.getProperty("/questions");
		currentArray.splice(currentCounter, 1);
		surveyModel.setProperty("/questions", currentArray);

		this.getView().previousView();
	},

	clearModel: function(){
		var input = {
			title   : "",
			answersChangable   : false,
			questions: []
		};

		var model = new sap.ui.model.json.JSONModel(input);
		this.getView().setModel(model, "survey");
		sap.ui.getCore().setModel(model, "survey");

		var info = {
			counter: -1,
			update: false
		};

		var infoModel = new sap.ui.model.json.JSONModel(info);
		sap.ui.getCore().setModel(infoModel, "info");
	},

	doNavBack: function(event) {
		this.bus.publish("nav", "back");
	},

	addSurvey: function(event){
		var controller = this;
		var model = this.getView().getModel("survey");
		console.log(model);
		var that= this;
		var survey = {
			name : model.getProperty("/title"),
			answersChangable : model.getProperty("/answersChangable"),
			questions: model.getProperty("/questions"),
			fingerprint: sap.ui.getCore().getModel("fingerprint").getProperty("/fingerprint")
		};

		$.ajax({
			url: './addNewSurvey',
			type: 'post',
			//	contentType: "application/json; charset=utf-8",
			success: function (data) {
				controller.clearModel();
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
	},

	updateSurvey: function(event){
		var controller = this;
		var model = this.getView().getModel("survey");
		var that= this;
		var survey = {
			name : model.getProperty("/title"),
			answersChangable : model.getProperty("/answersChangable"),
			surveyId: model.getProperty("/surveyId"),
			questions: model.getProperty("/questions")
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
		var model = this.getView().getModel("survey");
		var that= this;
		var survey = {
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
