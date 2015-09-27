jQuery.sap.require("quicksurvey.app.config");

sap.ui.jsview("quicksurvey.view.App", {

  getControllerName: function() {
    return "quicksurvey.view.App";
  },


  createContent: function(oController) {

    if(jQuery.sap.getUriParameters().get("mode") === "LeftMenuNavi"){
      quicksurvey.app.config.LaunchpadMode = false;
    }

    // set i18n model
    var oI18nModel = new sap.ui.model.resource.ResourceModel({
      bundleUrl: "i18n/i18n.properties"
    });
    sap.ui.getCore().setModel(oI18nModel, "i18n");
    this.setModel(oI18nModel, "i18n");

    // set device model
    var oDeviceModel = new sap.ui.model.json.JSONModel({
      isTouch: sap.ui.Device.support.touch,
      isNoTouch: !sap.ui.Device.support.touch,
      isPhone: sap.ui.Device.system.phone && !quicksurvey.app.config.LaunchpadMode,
      isNoPhone: !sap.ui.Device.system.phone,
      listMode: (sap.ui.Device.system.phone) ? "None" : "SingleSelectMaster",
      listItemType: (sap.ui.Device.system.phone) ? "Active" : "Inactive",
      launchpadMode: quicksurvey.app.config.LaunchpadMode
    });
    oDeviceModel.setDefaultBindingMode("OneWay");
    sap.ui.getCore().setModel(oDeviceModel, "device");
    this.setModel(oDeviceModel, "device");

    // to avoid scrollbars on desktop the root view must be set to block display
    this.setDisplayBlock(true);

    this.app = new sap.m.SplitApp("splitapp", {
      afterDetailNavigate: function() {
        if (sap.ui.Device.system.phone || quicksurvey.app.config.LaunchpadMode) {
          this.hideMaster();
        }
      },
      homeIcon: {
        'phone': 'img/57_iPhone_Desktop_Launch.png',
        'phone@2': 'img/114_iPhone-Retina_Web_Clip.png',
        'tablet': 'img/72_iPad_Desktop_Launch.png',
        'tablet@2': 'img/144_iPad_Retina_Web_Clip.png',
        'favicon': 'img/favicon.ico',
        'precomposed': false
      }
    });
    if(quicksurvey.app.config.LaunchpadMode){
      this.app.setMode(sap.m.SplitAppMode.HideMode);
    }


    this.app.addMasterPage(sap.ui.jsview("Menu", "quicksurvey.view.Menu"));

    if(quicksurvey.app.config.LaunchpadMode){
      this.app.addDetailPage(sap.ui.jsview("Launchpad", "quicksurvey.view.Launchpad"));
    }
    this.app.addDetailPage(sap.ui.xmlview("Info", "quicksurvey.view.Info"));
    this.app.addDetailPage(sap.ui.jsview("SurveyList", "quicksurvey.view.SurveyList"));
    this.app.addDetailPage(sap.ui.jsview("PerformSurvey", "quicksurvey.view.PerformSurvey"));
    this.app.addDetailPage(sap.ui.jsview("AddSurvey", "quicksurvey.view.AddSurvey"));
    this.app.addDetailPage(sap.ui.jsview("StartSurvey", "quicksurvey.view.StartSurvey"));
    this.app.addDetailPage(sap.ui.jsview("AnalyseSurvey", "quicksurvey.view.AnalyseSurvey"));

    // navigate to the first page in both master and detail areas.
    // the toMaster must be called after calling the toDetail, because both of them point to the same reference in phone and
    // the real first page that will be shown in phone is the page in master area.
    if(quicksurvey.app.config.LaunchpadMode){
      this.app.toDetail("Launchpad");
    } else {
      this.app.toMaster("Menu");
    }


    return this.app;
  }
});
