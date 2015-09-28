jQuery.sap.require("sap.ui.layout.form.SimpleForm");
jQuery.sap.require("sap.ui.unified.Calendar");
jQuery.sap.require("sap.ui.unified.DateRange");

sap.ui.jsview("quicksurvey.view.StartSurvey", {

	/**
	* Specifies the Controller belonging to this View. In the case that it is
	* not implemented, or that "null" is returned, this View does not have a
	* Controller.
	*
	* @memberOf view.NewFeatues-v122
	*/
	getControllerName : function() {
		return "quicksurvey.view.StartSurvey";
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
			tooltip : "{i18n>BACK_TO_SURVEY_LIST}",
			press : function(ev) {
				sap.ui.getCore().getEventBus().publish("nav", "to", {id : "SurveyList"});
			}
		});
		var oBtnNew = new sap.m.Button({
			icon : "sap-icon://begin",
			tooltip : "{i18n>START}",
			press : function(ev) {
				oController.startSurvey();
			}
		});
		var form = this.createStartSurveyForm();
		var page =  new sap.m.Page({
			title : "{i18n>START_SURVEY}",
			showNavButton: "{device>/isPhone}",
			headerContent:[oBtnLaunchpad],
			content: [form],
			navButtonPress: [oController.doNavBack, oController],
			footer: new sap.m.Bar({
				contentRight: [oBtnNew]
			})
		});
		this.page = page;
		return page;
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

	createStartSurveyForm: function(title){
		var oForm = this.createForm();


		var oAutostopToggle = new sap.m.ToggleButton({
			pressed: {path: "startSurvey>/autostop"},
			press : function(evt){
				if (evt.getSource().getPressed()){
					this.getModel("startSurvey").setProperty("/autostop", true);
				} else {
					this.getModel("startSurvey").setProperty("/autostop", false);
				}
			},
		});
		oAutostopToggle.bindProperty("text", "startSurvey>/autostop", function(autostop){
				return autostop?"Yes":"No";
		});
		var oAutostopToggleLabel = new sap.m.Label({
			text : "{i18n>AUTOSTOP}",
			labelFor : oAutostopToggle
		});

		oForm.addContent(oAutostopToggleLabel);
		oForm.addContent(oAutostopToggle);

		var oMinutes = new sap.m.Input({
			value: {
				path: "startSurvey>/minutes"
			},
			enabled: {
				path: "startSurvey>/autostop"
			},
			type: sap.m.InputType.Number
		});

		var oMinutesLabel = new sap.m.Label({
			text : "{i18n>MINUTES}",
			labelFor : oMinutes
		});
		oForm.addContent(oMinutesLabel);
		oForm.addContent(oMinutes);

		return oForm;
	}

});
