// ======= HECQTA ========
jQuery.sap.require("sap.ui.layout.form.SimpleForm");
sap.ui.jsview("quicksurvey.view.Launchpad", {

  getControllerName: function() {
    return "quicksurvey.view.Launchpad";
  },

  createContent: function(oController) {
    var form = new sap.ui.layout.form.SimpleForm({
      maxContainerCols: 2,
      editable        : true,
      layout          : "ResponsiveGridLayout",
    });

    var oSearchBar = new sap.m.Input({
      type: sap.m.InputType.Number,
      change: function(oEvent){
        oEvent.getSource().setValue("");
        sap.ui.getCore().getEventBus().publish("nav", "to", {id : "PerformSurvey", surveyId:  oEvent.getParameters().value,isNew: true});
      }
    });
    var oSearchBarLabel = new sap.m.Label({
      text : "Search by ID",
      labelFor : oSearchBar
    });
    form.addContent(oSearchBarLabel);
    form.addContent(oSearchBar);

    var page = new sap.m.Page({
      setShowHeader: true,
      title: "QuickSurvey",
      footer: new sap.m.Bar({
        contentMiddle: [new sap.m.Text({
          text: "v0.1.0",
        })],
        contentRight: [new sap.m.Button({
          text: "Administration",
          icon: "sap-icon://shield",
          press : function(ev) {
            sap.ui.getCore().getEventBus().publish("nav", "to", {id : "SurveyList"});
          }
        })]
      })
    });

    page.setEnableScrolling(false);
    page.setShowHeader(true);
    page.addContent(form);

    return page;
  }

});
