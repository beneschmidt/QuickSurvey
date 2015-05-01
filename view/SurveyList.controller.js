sap.ui.controller("ui5bp.view.SurveyList", {

    onInit: function() {
        this.getView().setModel(new sap.ui.model.json.JSONModel("model/survey.json"));
        this.bus = sap.ui.getCore().getEventBus();
    },

    doNavBack: function(event) {
        this.bus.publish("nav", "back");
    }    
    
});