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

			if(this.getView().page){
				// update content
				this.getView().page.removeAllContent();
				var form = this.getView().getCurrentForm(data.type);
				var selectCombo = this.getView().createSelectDialogCombo();
				form.addContent(selectCombo.label);
				form.addContent(selectCombo.button);
				this.getView().page.addContent(form);

				var oController = this;

				var footerArrayRight = [], footerArrayLeft=[];

				var currentCounter = this.getView().getModel("counter").getProperty("/counter");
				var numberOfQuestions = this.getView().getModel("survey").getProperty("/questions").length;
				if(currentCounter>=0){
					var oBtnPrevious = new sap.m.Button({
						icon : "sap-icon://arrow-left",
						tooltip : "previous page",
						press : function(ev) {
							oController.getView().previousView();
						}
					});
					footerArrayLeft.push(oBtnPrevious);


					var oBtnClearQuestion = new sap.m.Button({
						icon : "sap-icon://sys-cancel-2",
						visible : quicksurvey.app.config.LaunchpadMode,
						tooltip : "Clear question",
						press : function(ev) {
							oController.clearQuestion();
						}
					});
					footerArrayRight.push(oBtnClearQuestion);
				}
				if(currentCounter< numberOfQuestions-1){
					var oBtnNext = new sap.m.Button({
						icon : "sap-icon://arrow-right",
						tooltip : "next page",
						press : function(ev) {
							oController.getView().nextView();
						}
					});
					footerArrayRight.push(oBtnNext);
				}
				var oBtnNew = new sap.m.Button({
					icon : "sap-icon://save",
					visible : quicksurvey.app.config.LaunchpadMode,
					tooltip : "Create a new survey",
					press : function(ev) {
						oController.addSurvey();
					}
				});
				footerArrayRight.push(oBtnNew);
				var bar = new sap.m.Bar({
					contentRight: footerArrayRight,
					contentLeft: footerArrayLeft
				});

				this.getView().page.setFooter(bar);
			}
		}
	},

	updateModel: function(json){
		var model = new sap.ui.model.json.JSONModel(json);
		this.getView().setModel(model, "input");
	},

	clearQuestion: function(){
		var currentCounter = this.getView().getModel("counter").getProperty("/counter");
		var surveyModel = this.getView().getModel("survey");
		var currentArray = surveyModel.getProperty("/questions");
		currentArray.splice(currentCounter, 1);
		surveyModel.setProperty("/questions", currentArray);

		this.getView().previousView();
	},

	prevView : function(){
		var model = this.getView().getModel("counter");
		model.setProperty("counter", model.getProperty("/counter")-1);
		console.log(model.getProperty("/counter"));
		this.getView().rerender();
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

		var counter = {
			counter: -1
		}

		var counterModel = new sap.ui.model.json.JSONModel(counter);
		sap.ui.getCore().setModel(counterModel, "counter");
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
			questions: model.getProperty("/questions")
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
	}

});
