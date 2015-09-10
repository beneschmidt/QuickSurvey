jQuery.sap.require("quicksurvey.app.config");
jQuery.sap.require("quicksurvey.view.TitleForm");

sap.ui.jsview("quicksurvey.view.SurveyList", {

  getControllerName: function() {
    return "quicksurvey.view.SurveyList";
  },

  createContent: function(oController) {

    var oListTemplate = new sap.m.StandardListItem({
      icon: "sap-icon://document-text",
      description: "{name}",
      type: "Active",
      customData:[new sap.ui.core.CustomData({key: "objectId", value: "{objectId}"})],
      press: function(ev){
        var object = {id : "ChangeSurvey", surveyId: this.getCustomData()[0].getProperty("value")};
        sap.ui.getCore().getEventBus().publish("nav", "to", object);
      },
    });
    oListTemplate.bindProperty("title", "name");
    oListTemplate.bindProperty("info", "finished", function(finished) {
      if (finished) {
        return "Finished"
      } else{
        return "Not finished";
      }
    });
    oListTemplate.bindProperty("infoState", "finished", function(finished) {
      if (finished) {
        return sap.ui.core.ValueState.Error;
      } else{
        return sap.ui.core.ValueState.Success;
      }
    });

    var oList = new sap.m.List({});
    oList.bindAggregation("items", "/Survey", oListTemplate);

    var oBtnNew = new sap.m.Button({
      icon : "sap-icon://create",
      visible : quicksurvey.app.config.LaunchpadMode,
      tooltip : "Create a new survey",
      press : function(ev) {
        sap.ui.getCore().getEventBus().publish("nav", "to", {
          id : "AddSurvey"
        });
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
