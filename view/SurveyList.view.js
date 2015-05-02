jQuery.sap.require("ui5bp.app.config");

sap.ui.jsview("ui5bp.view.SurveyList", {

    getControllerName: function() {
        return "ui5bp.view.SurveyList";
    },

    createContent: function(oController) {

        var oListTemplate = new sap.m.StandardListItem({
            title: "{name}",
            icon: "sap-icon://document-text",
            description: "{name}",
        });

        var oList = new sap.m.List({});
        oList.bindAggregation("items", "/Survey", oListTemplate);

        var oBtnLaunchpad = new sap.m.Button({
            icon : "sap-icon://home",
            visible : ui5bp.app.config.LaunchpadMode,
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
            headerContent: [oBtnLaunchpad],
            footer: new sap.m.Bar({})
        });
    },

});