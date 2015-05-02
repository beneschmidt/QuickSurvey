jQuery.sap.require("quicksurvey.app.config");

sap.ui.jsview("quicksurvey.view.SurveyList", {

    getControllerName: function() {
        return "quicksurvey.view.SurveyList";
    },

    createContent: function(oController) {

        var oListTemplate = new sap.m.StandardListItem({
            title: "{name}",
            icon: "sap-icon://document-text",
            description: "{name}",
			type: "Active"
        });

        var oList = new sap.m.List({});
        oList.bindAggregation("items", "/Survey", oListTemplate);

		var oBtnNew = new sap.m.Button({
            icon : "sap-icon://create",
            visible : quicksurvey.app.config.LaunchpadMode,
            tooltip : "Create a new survey",
            press : function(ev) {
				console.log("Not yet implemented");
                //sap.ui.getCore().getEventBus().publish("nav", "back", {id : "Launchpad"});
            }
        });
		
        var oBtnLaunchpad = new sap.m.Button({
            icon : "sap-icon://home",
            visible : quicksurvey.app.config.LaunchpadMode,
            tooltip : "Back to Launchpad",
            press : function(ev) {
                sap.ui.getCore().getEventBus().publish("nav", "back", {id : "Launchpad"});
            }
        });

        return new sap.m.Page({
            title: "Administration Menu",
            showNavButton: "{device>/isPhone}",
            navButtonPress: [oController.doNavBack, oController],
            content: [oList],
            headerContent: [oBtnNew, oBtnLaunchpad],
            footer: new sap.m.Bar({})
        });
    },

});