jQuery.sap.require("sap.ui.layout.form.SimpleForm");
jQuery.sap.require("sap.ui.unified.Calendar");
jQuery.sap.require("sap.ui.unified.DateRange");

sap.ui.jsview("quicksurvey.view.AddSurvey", {

	/**
	* Specifies the Controller belonging to this View. In the case that it is
	* not implemented, or that "null" is returned, this View does not have a
	* Controller.
	*
	* @memberOf view.NewFeatues-v122
	*/
	getControllerName : function() {
		return "quicksurvey.view.AddSurvey";
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
			tooltip : "Back to Survey List",
			press : function(ev) {
				sap.ui.getCore().getEventBus().publish("nav", "to", {id : "SurveyList"});
			}
		});
		var page =  new sap.m.Page({
			title : "Add Survey",
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
			id : "AddSurvey"
		});
	},

	getCurrentForm : function(){
		if(this.getModel("info")){
			var currentCounter = this.getCurrentCounter();
			if(currentCounter === -1){
				return this.createTitleForm();
			} else {
				return this.createFormForType(this.getModel("survey").getProperty("/questions/"+currentCounter+"/type"));
			}
		}
	},

	createFormForType:function(type, position){
		// type 1: ja/nein
		// type 2: grades
		switch(type){
			case 1: {
				return this.createQuestionForm("Yes/No question");
			}
			case 2: {
				// create grades
				return this.createQuestionForm("Grades question");
			}
			default: {
				// not sure
			}
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

	// can't be in renderer
	createTitleForm: function(){
		var oForm = this.createForm();
		var oTitle = new sap.m.Input({
			value: {
				path: "survey>/title"
			}
		});
		var oTitleLabel = new sap.m.Label({
			text : "Survey Title",
			labelFor : oTitle
		});
		oForm.addContent(oTitleLabel);
		oForm.addContent(oTitle);
		var that = this;

		// change answers
		var oChangeAnswers = new sap.m.ToggleButton({
			pressed: {path: "survey>/answersChangable"},
			press : function(evt){
				if (evt.getSource().getPressed()){
					this.getModel("survey").setProperty("/answersChangable", true);
					oChangeAnswers.setText("Yes");
				} else {
					this.getModel("survey").setProperty("/answersChangable", false);
					oChangeAnswers.setText("No");
				}
			}
		});
		oChangeAnswers.bindProperty("text", "survey>/answersChangable", function(changable) {
			if (changable) {
				return "Yes"
			} else{
				return "No";
			}
		});
		var oChangeAnswersLabel = new sap.m.Label({
			text : "Answers changable",
			labelFor : oChangeAnswers
		});
		oForm.addContent(oChangeAnswersLabel);
		oForm.addContent(oChangeAnswers);

		return oForm;
	},

	createYesNoForm: function(){
		var oForm = this.createForm();
		var oTitleLabel = new sap.m.Label({
			text : "Yes/No question",
		});
		oForm.addContent(oTitleLabel);
		var currentCounter = this.getCurrentCounter();
		var oQuestionText = new sap.m.Input({
			value: {
				path: "survey>/questions/"+currentCounter+"/questiontext"
			}
		});
		var oQuestionTextLabel = new sap.m.Label({
			text : "Question text",
			labelFor : oQuestionText
		});
		oForm.addContent(oQuestionTextLabel);
		oForm.addContent(oQuestionText);
		var that = this;

		var oYesItem = new sap.m.StandardListItem({
			title: "Yes"
		});
		var oNoItem = new sap.m.StandardListItem({
			title: "No"
		});
		var oAnswerList = new sap.m.List({
			mode: sap.m.ListMode.None,
			items: [oYesItem, oNoItem]
		});
		var oAnswersLabel = new sap.m.Label({
			text : "Answers",
			labelFor : oAnswerList
		});
		oForm.addContent(oAnswersLabel);
		oForm.addContent(oAnswerList);

		return oForm;
	},

	createQuestionForm: function(title){
		var oForm = this.createForm();
		var oTitleLabel = new sap.m.Label({
			text : title,
		});
		oForm.addContent(oTitleLabel);
		var currentCounter = this.getCurrentCounter();
		var oQuestionText = new sap.m.Input({
			value: {
				path: "survey>/questions/"+currentCounter+"/questiontext"
			}
		});

		var oQuestionTextLabel = new sap.m.Label({
			text : "Question text",
			labelFor : oQuestionText
		});
		oForm.addContent(oQuestionTextLabel);
		oForm.addContent(oQuestionText);

		var oAnswerList = new sap.m.ListBase();
		oAnswerList.bindAggregation("items", "survey>/questions/"+currentCounter+"/answers", function(sId, oContext) {
			var value = oContext.getProperty("answertext");
			return new sap.m.StandardListItem({
				title: value,
			});
		});
		var oAnswersLabel = new sap.m.Label({
			text : "Answers",
			labelFor : oAnswerList
		});
		oForm.addContent(oAnswersLabel);
		oForm.addContent(oAnswerList);

		return oForm;
	},

	createSelectDialogCombo: function(){
		var that = this;
		// add new question dialog
		var listItemYesNo = new sap.m.StandardListItem({
			title: "Yes/No",
			customData:[new sap.ui.core.CustomData({key: "type", value: 1}),
			new sap.ui.core.CustomData({key: "multiple", value: false}),
			new sap.ui.core.CustomData({key: "items", value: [{answertext:"Yes"}, {answertext:"No"}]})]
		});
		var listItemGrades = new sap.m.StandardListItem({
			title: "Grades (1-5)",
			customData:[new sap.ui.core.CustomData({key: "type", value: 2}),
			new sap.ui.core.CustomData({key: "multiple", value: false}),
			new sap.ui.core.CustomData({key: "items", value: [{answertext: "1"},{answertext:"2"},{answertext:"3"},{answertext:"4"},{answertext:"5"}]})]
			//new sap.ui.core.CustomData({key: "items", value: [{test: "0",answertext: "one"},{test: "1",answertext:"two"}]})]
		});
		var oSelectDialog = new sap.m.SelectDialog({
			title: "Add new Question",
			noDataText: "Nothing possible",
			items : [listItemYesNo, listItemGrades],
			confirm: function(evt){
				var nextCounter = that.getCurrentCounter()+1;
				var customData = evt.getParameters().selectedItems[0].getCustomData();
				var type =customData[0].getProperty("value");
				var multiple = customData[1].getProperty("value");
				var items = customData[2].getProperty("value");
				var question = {
					type: type,
					questiontext: "",
					multiple: multiple,
					answers: items
				}
				var arr = that.getModel("survey").getProperty("/questions");
				arr.splice(nextCounter, 0 , question);
				that.getModel("survey").setProperty("/questions", arr);
				that.nextView();
			}
		});

		var oSelectDialogLabel = new sap.m.Label({
			text : "Add new Question",
			labelFor : oSelectDialog
		});
		var oSelectDialogBtn = new sap.m.Button({
			icon : "sap-icon://add",
			visible : quicksurvey.app.config.LaunchpadMode,
			tooltip : "Create new Question",
			press : function(ev) {
				oSelectDialog.open();
			}
		});

		var object = {
			button: oSelectDialogBtn,
			label: oSelectDialogLabel
		}
		return object;
	},

});
