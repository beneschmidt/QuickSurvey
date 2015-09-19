jQuery.sap.require("quicksurvey.app.config");

sap.ui.jsview("quicksurvey.view.SurveyList", {

  getControllerName: function() {
    return "quicksurvey.view.SurveyList";
  },

  createContent: function(oController) {
    var oCustomListTemplate = new sap.m.CustomListItem({
      type: "Active",
      content: [new sap.m.FlexBox({
        direction: sap.m.FlexDirection.Row,
        justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
        items: [
          new sap.m.Title({
            text: "{name}",
            textAlign: sap.ui.core.TextAlign.Left,
            titleStyle: sap.ui.core.TitleLevel.H3
          }),
          new sap.m.Label({
            text:{
              parts: [{path: "finishat"}],
              formatter: function(finishat){
                if(finishat==-1){
                  return "running";
                } else if(finishat+0===0){
                  return "not started yet"
                } else if(finishat+0 && new Date().getTime() < finishat){
                  var date = new Date(finishat- new Date().getTime());
                  return date.getMinutes()+":"+date.getSeconds();
                } else{
                  return "finished";
                }
              }
            },
          }),
          new sap.m.FlexBox({
            direction: sap.m.FlexDirection.Row,
            justifyContent: sap.m.FlexJustifyContent.End,
            items: [
              new sap.m.Button({
                icon : "sap-icon://bar-code",
                press: function(oEvent){
                  var context = oEvent.getSource().getBindingContext();
                  var surveyId = context.getProperty("objectId");
                  console.log("QR Code");
                },
              }),
              new sap.m.Button({
                icon : "sap-icon://media-play",
                visible:{
                  parts: [{path: "finishat"}],
                  formatter: function(finishat){
                    if(finishat==-1 || finishat+0>0){
                      return false;
                    } else {
                      return true;
                    }
                  }
                },
                press: function(oEvent){
                  var context = oEvent.getSource().getBindingContext();
                  var surveyId = context.getProperty("objectId");
                  var object = {id : "StartSurvey", surveyId: surveyId, isNew: true};
                  sap.ui.getCore().getEventBus().publish("nav", "to", object);
                },
              }),
              new sap.m.Button({
                icon : "sap-icon://stop",
                visible:{
                  parts: [{path: "finishat"}],
                  formatter: function(finishat){
                    if(finishat==-1 || (finishat+0 && new Date().getTime() < finishat)){
                      return true;
                    } else {
                      return false;
                    }
                  },
                },
                press: function(oEvent){
                  var context = oEvent.getSource().getBindingContext();
                  var surveyId = context.getProperty("objectId");
                  console.log("stopping survey "+surveyId);
                  oController.stopSurvey(surveyId);
                },
              }),
              new sap.m.Button({
                icon : "sap-icon://delete",
                press: function(oEvent){
                  var context = oEvent.getSource().getBindingContext();
                  var surveyId = context.getProperty("objectId");
                  console.log("deleting survey");
                  oController.deleteSurvey(surveyId);
                },
              }),
            ]
          }),
        ]
      })],
      press: function(ev){
        var context = ev.getSource().getBindingContext();
        var surveyId = context.getProperty("objectId");
        var startedat = context.getProperty("startedat");
        var finishat = context.getProperty("finishat");
        var idToNavTo = "";
        if(!startedat){
          idToNavTo="StartSurvey";
        } else if (finishat && new Date().getTime() < finishat){
          idToNavTo="PerformSurvey"
        } else {
          // TODO should be anaylsis
          idToNavTo="AddSurvey";
        }
        var object = {id : idToNavTo, surveyId: surveyId, isNew: true};
        sap.ui.getCore().getEventBus().publish("nav", "to", object);
      },
    });

    var oList = new sap.m.List({});
    oList.bindAggregation("items", "/Survey", oCustomListTemplate);

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
