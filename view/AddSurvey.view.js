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

	nextView : function(){
		var model = this.getModel("counter");
		model.setProperty("/counter", model.getProperty("/counter")+1);
		console.log(model.getProperty("/counter"));
		sap.ui.getCore().getEventBus().publish("nav", "to", {
			id : "AddSurvey"
		});
	},

	getCurrentForm:function(){
		if(this.getModel("counter")){
			var currentCounter = this.getModel("counter").getProperty("/counter");
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
				console.log("here we go: "+type)
				// create yes/no
				return this.createYesNoForm();
			}
			case 2: {
				// create grades
			}
			default: {
				// not sure
			}
		}
	},

	// can't be in renderer
	createTitleForm: function(){
		var oForm = new sap.ui.layout.form.SimpleForm({
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
			text : "No",
			pressed: false,
			press : function(evt){
				if (evt.getSource().getPressed()){
					that.getModel("survey").setProperty("/answersChangable", true);
					oChangeAnswers.setText("Yes");
				} else {
					that.getModel("survey").setProperty("/answersChangable", false);
					oChangeAnswers.setText("No");
				}
			}
		});
		var oChangeAnswersLabel = new sap.m.Label({
			text : "Answers changable",
			labelFor : oChangeAnswers
		});
		oForm.addContent(oChangeAnswersLabel);
		oForm.addContent(oChangeAnswers);

		var selectCombo = this.createSelectDialogCombo();
		oForm.addContent(selectCombo.label);
		oForm.addContent(selectCombo.button);
		return oForm;
	},

	createYesNoForm: function(){
		var oForm = new sap.ui.layout.form.SimpleForm({
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
		var oTitleLabel = new sap.m.Label({
			text : "Yes/No question",
		});
		oForm.addContent(oTitleLabel);
		var currentCounter = this.getModel("counter").getProperty("/counter");
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

		return oForm;
	},

	createSelectDialogCombo: function(){
		var that = this;
		// add new question dialog
		var listItemYesNo = new sap.m.StandardListItem({
			title: "Yes/No",
			customData:[new sap.ui.core.CustomData({key: "type", value: 1}), new sap.ui.core.CustomData({key: "multiple", value: false})]
		});
		var listItemGrades = new sap.m.StandardListItem({
			title: "Grades (1-5)",
			customData:[new sap.ui.core.CustomData({key: "type", value: 2}), new sap.ui.core.CustomData({key: "multiple", value: false})]
		});
		var oSelectDialog = new sap.m.SelectDialog({
			title: "Add new Question",
			noDataText: "Nothing possible",
			items : [listItemYesNo, listItemGrades],
			confirm: function(evt){
				var nextCounter = that.getModel("counter").getProperty("/counter")+1;
				var type =evt.getParameters().selectedItems[0].getCustomData()[0].getProperty("value");
				var multiple = evt.getParameters().selectedItems[0].getCustomData()[1].getProperty("value");
				console.log(evt.getParameters().selectedItems[0].getTitle()+", "+type);
				var question = {
					type: type,
					questiontext: "",
					multiple: multiple,
					answers: []
				}
				that.getModel("survey").setProperty("/questions/"+nextCounter, question);
				console.log(that.getModel("survey").getProperty("/questions/"+nextCounter+"/type"));
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
