jQuery.sap.require("sap.ui.layout.form.SimpleForm");
jQuery.sap.require("sap.ui.unified.Calendar");
jQuery.sap.require("sap.ui.unified.DateRange");

sap.ui.jsview("quicksurvey.view.PerformSurvey", {

	/**
	* Specifies the Controller belonging to this View. In the case that it is
	* not implemented, or that "null" is returned, this View does not have a
	* Controller.
	*
	* @memberOf view.NewFeatues-v122
	*/
	getControllerName : function() {
		return "quicksurvey.view.PerformSurvey";
	},

	/**
	* Is initially called once after the Controller has been instantiated. It
	* is the place where the UI is constructed. Since the Controller is given
	* to this method, its event handlers can be attached right away.
	*
	* @memberOf view.NewFeatues-v122
	*/
	createContent : function(oController) {
		var that = this;

		var oBtnLaunchpad = new sap.m.Button({
			icon : "sap-icon://home",
			visible : quicksurvey.app.config.LaunchpadMode,
			tooltip : "Back to Home",
			press : function(ev) {
				sap.ui.getCore().getEventBus().publish("nav", "to", {id : "Launchpad"});
			}
		});
		var page =  new sap.m.Page({
			title : "{info>/title}",
			showNavButton: "{device>/isPhone}",
			headerContent:[oBtnLaunchpad],
			navButtonPress: [oController.doNavBack, oController]
		});
		this.page = page;
		return page;
	},

	getCurrentCounter:function(){
		return this.getModel("info").getProperty("/counter");
	},

	nextView : function(){
		this.navToView(+1);
	},

	previousView : function(){
		this.navToView(-1);
	},

	navToView:function(viewDirection){
		this.getModel("info").setProperty("/counter", this.getCurrentCounter()+viewDirection);
		sap.ui.getCore().getEventBus().publish("nav", "to", {
			id : "PerformSurvey"
		});
	},

	getCurrentForm : function(){
		if(this.getModel("info")){
			var currentCounter = this.getCurrentCounter();
			if(this.getModel("info").getProperty("/notExisting")){
				return this.createNotPossibleForm("Not existing", "Unfortunately the survey is not existing");
			} else 	if(this.getModel("info").getProperty("/notStarted")){
				return this.createNotPossibleForm("Not started", "Unfortunately the survey is not started yet");
			} else 	if(this.getModel("info").getProperty("/finished")){
				return this.createNotPossibleForm("Already finished", "Unfortunately the survey is is already finished");
			} else 	if(currentCounter===this.getModel("survey").getProperty("/questions").length){
				return this.createThanksForm();
			} else {
				var questionText = this.getModel("survey").getProperty("/questions/"+currentCounter+"/questiontext");
				return this.createFormForType(this.getModel("survey").getProperty("/questions/"+currentCounter+"/type"), questionText);
			}
		}
	},

	createFormForType:function(type, questionText){
		if(type==5){
			return this.createFreeTextForm(questionText);
		} else {
			return this.createQuestionForm(questionText);
		}
	},

	createForm: function(){
		return new sap.ui.layout.form.SimpleForm({
			maxContainerCols: 2,
			editable        : true,
			layout          : "ResponsiveGridLayout",
			//title           : "Date Controls",
			labelSpanL : 4,
			labelSpanM : 4,
			emptySpanL : 1,
			emptySpanM : 1,
			columnsL   : 1,
			columnsM   : 1
		});
	},

	createQuestionForm: function(title){
		this.getModel("info").setProperty("/title", title);
		var oForm = this.createForm();
		//oForm.addContent(oTitleLabel);
		var currentCounter = this.getCurrentCounter();
		var that = this;

		var oQuestionText = new sap.m.Text({
			text: {
				path: "survey>/questions/"+currentCounter+"/questiontext"
			},
			textAlign: sap.ui.core.TextAlign.Center
		});
		oQuestionText.addStyleClass("questionTitle");
		var oQuestionTextLabel = new sap.m.Label({
			text : "Question text",
			labelFor : oQuestionText
		});
		//oForm.addContent(oQuestionTextLabel);
		oForm.addContent(oQuestionText);

		var oAnswerList = new sap.m.List({
			includeItemInSelection: true,
		});
		oAnswerList.bindAggregation("items", "survey>/questions/"+currentCounter+"/answers", function(sId, oContext) {
			var value = oContext.getProperty("answertext");
			var selectedItems = that.getModel("perform").getProperty("/performed_questions/"+currentCounter+"/performed_answers");
			var item = new sap.m.StandardListItem({
				title: value,
				customData: [new sap.ui.core.CustomData({key:"objectId", value: oContext.getProperty("objectId")})]
			});
			item.addDelegate({
				onAfterRendering: function(){
					// this needs to be done to make sure that on a return to an already answered question the correct answer is selected
					var performedAnswers = that.getModel("perform").getProperty("/performed_questions/"+currentCounter+"/performed_answers");
					for(var i = 0; i < performedAnswers.length; i++){
						if(performedAnswers[i].answer_id == this.getCustomData()[0].getProperty("value")){
							this.setSelected(true);
						}
					}
				}
			}, item);
			return item;
		});
		oAnswerList.bindProperty("mode", "survey>/questions/"+currentCounter+"/multiple", function(multiple) {
			if (multiple) {
				return sap.m.ListMode.MultiSelect;
			} else{
				return sap.m.ListMode.SingleSelectMaster
			}
		});

		oAnswerList.attachSelectionChange(function(oControlEvent){
			var selectedAnswer = oControlEvent.getParameters().listItem;
			var selected = oControlEvent.getParameters().selected;
			var answer_id = selectedAnswer.getCustomData()[0].getProperty("value");
			var currentArray =that.getModel("perform").getProperty("/performed_questions/"+that.getCurrentCounter()+"/performed_answers");
			if(selected){
				var newObj ={
					answer_id: selectedAnswer.getCustomData()[0].getProperty("value"),
					freetext:""
				}

				if(oControlEvent.getSource().getMode()==sap.m.ListMode.SingleSelectMaster){
					currentArray[0]=newObj;
				} else {
					currentArray.push(newObj);
				}
			} else {
				for(var i = 0; i < currentArray.length; i++){
					if(currentArray[i].answer_id == answer_id){
						currentArray.splice(i, 1);
						break;
					}
				}
			}
			var array = that.getModel("perform").setProperty("/performed_questions/"+that.getCurrentCounter()+"/performed_answers", currentArray);
		});
		var oAnswersLabel = new sap.m.Label({
			text : "Answers",
			labelFor : oAnswerList
		});
		oForm.addContent(oAnswersLabel);
		oForm.addContent(oAnswerList);

		return oForm;
	},

	createFreeTextForm: function(){
		this.getModel("info").setProperty("/title", "Free Text");
		var oForm = this.createForm();
		var currentCounter = this.getCurrentCounter();
		var that = this;

		var oQuestionText = new sap.m.Text({
			text: {
				path: "survey>/questions/"+currentCounter+"/questiontext"
			},
			textAlign: sap.ui.core.TextAlign.Center
		});
		oQuestionText.addStyleClass("questionTitle");
		oForm.addContent(oQuestionText);
		var that = this;

		// change answers
		var oAnswer = new sap.m.TextArea({
			value: {
				path: "perform>/performed_questions/"+currentCounter+"/performed_answers/0/freetext"
			}
		});
		var oAnswerLabel = new sap.m.Label({
			text : "Free text answer",
			labelFor : oAnswer
		});
		oForm.addContent(oAnswerLabel);
		oForm.addContent(oAnswer);

		return oForm;
	},

	createNextButton: function(currentCounter, numberOfQuestions){
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
		return oBtnNext;
	},

	createThanksForm: function(){
		var oForm = new sap.ui.layout.form.SimpleForm({
			editable        : false,
			layout          : "ResponsiveGridLayout",
		});
		this.getModel("info").setProperty("/title", "Thanks");
		//oForm.addContent(oTitleLabel);
		var currentCounter = this.getCurrentCounter();
		var that = this;

		var oThanksText = new sap.m.Title({
			text: "Thank you for participating",
			textAlign: sap.ui.core.TextAlign.Center,
			titleStyle: sap.ui.core.TitleLevel.H2
		});

		var oFinishedText = new sap.m.Title({
			text: "Unfortunately it was already finished",
			textAlign: sap.ui.core.TextAlign.Center,
			visible: {
				path:"info>/alreadyFinished"
			}
		});

		var oImage = new sap.m.Image({
			src: 'img/Smiley_Face.png'
		})
		var oButtonContainer = new sap.m.FlexBox({
			justifyContent: sap.m.FlexJustifyContent.Center,
			alignItems: sap.m.FlexAlignItems.Center,
			items: [oThanksText, oImage, oFinishedText],
			direction: sap.m.FlexDirection.Column
		}).addDelegate({
			onAfterRendering: function () {
				oImage.setHeight(oButtonContainer.$().height() + "px");
			}
		});
		oForm.addContent(new sap.m.Label());
		oForm.addContent(oButtonContainer);

		return oForm;
	},

	createNotPossibleForm: function(title, text){
		var oForm = new sap.ui.layout.form.SimpleForm({
			editable        : false,
			layout          : "ResponsiveGridLayout",
		});
		this.getModel("info").setProperty("/title", title);
		//oForm.addContent(oTitleLabel);
		var currentCounter = this.getCurrentCounter();
		var that = this;

		var oText = new sap.m.Text({
			text: text,
			textAlign: sap.ui.core.TextAlign.Center
		});
		oText.addStyleClass("questionTitle")

		var oImage = new sap.m.Image({
			src: 'img/Smiley_Face.png'
		})
		var oButtonContainer = new sap.m.FlexBox({
			justifyContent: sap.m.FlexJustifyContent.Center,
			alignItems: sap.m.FlexAlignItems.Center,
			items: [oText],
			direction: sap.m.FlexDirection.Column
		}).addDelegate({
			onAfterRendering: function () {
				oImage.setHeight(oButtonContainer.$().height() + "px");
			}
		});
		oForm.addContent(new sap.m.Label());
		oForm.addContent(oButtonContainer);

		return oForm;
	},

});
