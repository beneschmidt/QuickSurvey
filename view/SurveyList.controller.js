sap.ui.controller("quicksurvey.view.SurveyList", {

  onInit: function() {
    this.bus = sap.ui.getCore().getEventBus();
    this.bus.subscribe("nav", "to", this.navHandler, this);
  },

  navHandler: function(channelId, eventId, data){
    if (eventId === "to" && data.id==="SurveyList") {
      this.loadData();
    }
  },

  loadData: function(){
    var that= this;
    console.log("load data...");
    $.get("./surveyList", function( data ) {
      var json = JSON.parse(data);
      that.updateModel(json);
    }).error( function(jqXHR, textStatus, errorThrown) {
      if(jqXHR.readyState === 0){
        console.log(textStatus)
      } else {
        alert("An unknown error occured: "+jqXHR);
      }
    });
  },

  updateModel: function(json){
    var model = new sap.ui.model.json.JSONModel(json);
    this.getView().setModel(model);
    console.log(json);
  },

});
