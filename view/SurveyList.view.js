jQuery.sap.require("quicksurvey.app.config");

sap.ui.jsview("quicksurvey.view.SurveyList", {

  getControllerName: function() {
    return "quicksurvey.view.SurveyList";
  },

  createContent: function(oController) {

    var oListTemplate = new sap.m.StandardListItem({
      icon: "sap-icon://document-text",
      description: "{name}",
      type: "Active",
      customData:[new sap.ui.core.CustomData({key: "objectId", value: "{objectId}"}),
      new sap.ui.core.CustomData({key: "startedat", value: "{startedat}"}),
      new sap.ui.core.CustomData({key: "finishat", value: "{finishat}"})],
      press: function(ev){
        var surveyId = this.getCustomData()[0].getProperty("value");
        var startedat = this.getCustomData()[1].getProperty("value");
        var finishat = this.getCustomData()[2].getProperty("value");
        var idToNavTo = "";
        if(!startedat){
          idToNavTo="StartSurvey";
        } else if (finishat && new Date().getTime() < finishat){
          idToNavTo="PerformSurvey"
        } else {
          // TODO should be anaylsis
          idToNavTo="AddSurvey";
        }
        var object = {id : idToNavTo, surveyId: this.getCustomData()[0].getProperty("value"), isNew: true};
        sap.ui.getCore().getEventBus().publish("nav", "to", object);
      },
    });
    oListTemplate.bindProperty("title", "name");
    oListTemplate.bindProperty("info", {
      parts: [
        {path: "startedat"},
        {path: "finishat"}
      ],
      formatter: function(startedat, finishat){
        if(!startedat){
          return "Not yet started";
        } else if(finishat && new Date().getTime()< finishat){
          return "Started";
        } else {
          return "Finished";
        }
      }
    });
    oListTemplate.bindProperty("infoState", {
      parts: [
        {path: "startedat"},
        {path: "finishat"}
      ],
      formatter: function(startedat, finishat){
        if(!startedat){
          return sap.ui.core.ValueState.Error;
        } else if(finishat && new Date().getTime() < finishat){
          return sap.ui.core.ValueState.Warning;
        } else {
          return sap.ui.core.ValueState.Success;
        }
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
          id : "AddSurvey",
          isNew: true
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
