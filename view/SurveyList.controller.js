sap.ui.controller("ui5bp.view.SurveyList", {

    onInit: function() {
		var that= this;
		$.get("http://localhost:5433/surveyList", function( data ) {
			var json = JSON.parse(data);  
			that.updateModel(json);
		});
    },
	
	updateModel: function(json){
		var model = new sap.ui.model.json.JSONModel(json);
        this.getView().setModel(model);
        this.bus = sap.ui.getCore().getEventBus();
	},
	
	onRouteMatched : function(oEvent) {  
		console.log("route matched");
	},

    doNavBack: function(event) {
        this.bus.publish("nav", "back");
    }    
    
});