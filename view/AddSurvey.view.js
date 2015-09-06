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
			value : {
				path : "input>/title"
			}
		});
		var oTitleLabel = new sap.m.Label({
			text : "Survey Title",
			labelFor : oTitle
		});
		oForm.addContent(oTitleLabel);
		oForm.addContent(oTitle);

		var oChangeAnswers = new sap.m.ToggleButton({
			text : "No",
			pressed: false,
			press : function(evt){
				if (evt.getSource().getPressed()){
					this.getModel("input").setProperty("/answersChangable", true);
					oChangeAnswers.setText("Yes");
				} else {
					this.getModel("input").setProperty("/answersChangable", false);
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


		return new sap.m.Page({
			title : "Add Survey",
			showNavButton: "{device>/isPhone}",
			navButtonPress: [oController.doNavBack, oController],
			content : [ oForm ],
			headerContent: [oBtnLaunchpad],
			footer: bar
		});
	}

	/*var oMultiComboBox = new sap.m.MultiComboBox({
	items: {
	path: "coffee>/Coffee", template: new sap.ui.core.Item({
	key: "{coffee>name}",
	text: "{coffee>name}"
})
}
});
var oMultiComboBoxLabel = new sap.m.Label({
text : "NEW MulitComboBox Control",
labelFor : oMultiComboBox
});
oForm2.addContent(oMultiComboBoxLabel);
oForm2.addContent(oMultiComboBox);

var oMultiInput = new sap.m.MultiInput();
oMultiInput.addValidator(function(args){
var text = args.text;
return new sap.m.Token({key: text, text: text});
});
var oMultiInputLabel = new sap.m.Label({
text : "NEW MulitInput Control",
labelFor : oMultiInput
});

oForm2.addContent(oMultiInputLabel);
oForm2.addContent(oMultiInput);
*/
/*
var oIconTabBar = new sap.m.IconTabBar({
items: [
new sap.m.IconTabFilter({
text: "Date Input Controls",
content : [oForm]
}),
new sap.m.IconTabFilter({
text: "Other Input Controls",
content : [oForm2]
})
]
});
*/

});
