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
            textAlign: sap.ui.core.TextAlign.Center,
            titleStyle: sap.ui.core.TitleLevel.H3
          }),
          new sap.m.Label({
            text:{
              parts: [{path: "finishat"}],
              formatter: function(finishat){
                if(finishat==-1){
                  return sap.ui.getCore().getModel("i18n").getProperty("RUNNING");
                } else if(finishat+0===0){
                  return  sap.ui.getCore().getModel("i18n").getProperty("NOT_STARTED");
                } else if(finishat+0 && new Date().getTime() < finishat){
                  var date = new Date(finishat- new Date().getTime());
                  return date.getMinutes()+":"+date.getSeconds();
                } else{
                  return  sap.ui.getCore().getModel("i18n").getProperty("FINISHED");
                }
              }
            }
          }),
          new sap.m.FlexBox({
            direction: sap.m.FlexDirection.Row,
            justifyContent: sap.m.FlexJustifyContent.End,
            items: [
              new sap.m.Button({
                icon : "sap-icon://duplicate",
                press: function(oEvent){
                  var context = oEvent.getSource().getBindingContext();
                  var surveyId = context.getProperty("objectId");
                  var object = {id : "AddSurvey", surveyId: surveyId, isNew: true, copyOfSurvey: true};
                  sap.ui.getCore().getEventBus().publish("nav", "to", object);
                }
              }),
              new sap.m.Button({
                icon : "sap-icon://bar-code",
                press: function(oEvent){
                  var context = oEvent.getSource().getBindingContext();
                  var surveyId = context.getProperty("objectId");
                  var flexBox = new sap.m.FlexBox({
                    height: "100%",
                    justifyContent: "Center"
                  });
                  flexBox.addStyleClass("qrCode");
                  var dialog = new sap.m.Dialog({
                    title: "ID: "+surveyId,
                    contentHeight:"100%",
                    type: sap.m.DialogType.Standard,
                    content: [flexBox],
                    afterClose: function() {
                      dialog.destroy();
                    }
                  }).setStretch(true).open();
                  var dialogDOM = $("#"+dialog.getId())[0];
                  var size = Math.min(dialogDOM.offsetHeight, dialogDOM.offsetWidth)-92;
                  new QRCode(flexBox.getId(), {
                    text: window.location.toLocaleString()+"perform.html?id="+surveyId,
                    width: size,
                    height: size
                  });

                  $("#"+flexBox.getId())[0].onclick=function(){
                    dialog.close();
                  }
                }
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
                }
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
                  }
                },
                press: function(oEvent){
                  var context = oEvent.getSource().getBindingContext();
                  var surveyId = context.getProperty("objectId");
                  console.log("stopping survey "+surveyId);
                  oController.stopSurvey(surveyId);
                }
              }),
              new sap.m.Button({
                icon : "sap-icon://delete",
                press: function(oEvent){
                  var context = oEvent.getSource().getBindingContext();
                  var surveyId = context.getProperty("objectId");

                  var context = oEvent.getSource().getBindingContext();
                  var surveyId = context.getProperty("objectId");
                  var surveyText = context.getProperty("name");
                  var dialog = new sap.m.Dialog({
                    title: surveyText,
                    contentHeight:"100%",
                    type: sap.m.DialogType.Standard,
                    content: new sap.m.Text({ text: '{i18n>CONFIRM_DELETE}' }),
                    beginButton: new sap.m.Button({
                      text: '{i18n>YES}',
                      press: function (oEvent) {
                        console.log("deleting survey");
                        oController.deleteSurvey(surveyId);
                        dialog.close();
                      }
                    }),
                    endButton: new sap.m.Button({
                      text: '{i18n>NO}',
                      press: function () {
                        dialog.close();
                      }
                    }),
                    afterClose: function() {
                      dialog.destroy();
                    }
                  }).open();
                }
              })
            ]
          })
        ]
      })],
      press: function(ev){
        var context = ev.getSource().getBindingContext();
        var surveyId = context.getProperty("objectId");
        var startedat = context.getProperty("startedat");
        var finishat = context.getProperty("finishat");
        var idToNavTo = "";
        if(!startedat){
          idToNavTo="AddSurvey";
        } else if (finishat && new Date().getTime() < finishat){
          idToNavTo="PerformSurvey"
        } else {
          // TODO should be anaylsis
          idToNavTo="AnalyseSurvey";
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
      tooltip : "{i18n>CREATE_NEW_SURVEY}",
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
      tooltip : "{i18n>BACK_TO_HOME}",
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
