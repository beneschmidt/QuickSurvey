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
		var oBtnNew = new sap.m.Button({
			icon : "sap-icon://create",
			visible : quicksurvey.app.config.LaunchpadMode,
			tooltip : "Create a new survey",
			press : function(ev) {
				oController.addSurvey();
			}
		});

		var bar = new sap.m.Bar({});
		bar.addContentRight(oBtnNew);

		var oBtnLaunchpad = new sap.m.Button({
			icon : "sap-icon://home",
			visible : quicksurvey.app.config.LaunchpadMode,
			tooltip : "Back to Survey List",
			press : function(ev) {
				sap.ui.getCore().getEventBus().publish("nav", "to", {id : "SurveyList"});
			}
		});

		var hor = new sap.ui.layout.HorizontalLayout();
		hor.bindAggregation("content", "device>/isPhone", function(counter) {
			if(counter===0){
				return that.createForm();
			} else {
				return that.createForm();
			}
		});
		var page =  new sap.m.Page({
			title : "Add Survey",
			showNavButton: "{device>/isPhone}",
			navButtonPress: [oController.doNavBack, oController],
			headerContent: [oBtnLaunchpad],
			content: hor,
			footer: bar
		});
		this.page = page;
		return page;
	},

	getCurrentForm:function(){
		if(this.getModel("counter")){
			var currentCounter = this.getModel("counter").getProperty("counter");
			if(currentCounter === 0){
				return this.createForm();
			} else {
				return this.createForm();
			}
		}
	},

	// can't be in renderer
	createForm: function(){
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

		// add new question dialog
		var listItemYesNo = new sap.m.StandardListItem({
			title: "Yes/No"
		});
		var listItemGrades = new sap.m.StandardListItem({
			title: "Grades (1-5)"
		});
		var oSelectDialog = new sap.m.SelectDialog("QuestionDialog", {
			title: "Add new Question",
			noDataText: "Nothing possible",
			items : [listItemYesNo, listItemGrades],
			confirm: function(evt){
				console.log(evt.getParameters().selectedItems[0].getTitle());
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
		oForm.addContent(oSelectDialogLabel);
		oForm.addContent(oSelectDialogBtn);
		return oForm;
	},

});
