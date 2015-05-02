sap.ui.controller("ui5bp.view.SurveyList", {

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
		$.get("http://localhost:5433/surveyList", function( data ) {
			var json = JSON.parse(data);  
			that.updateModel(json);
		});
	},
	
	updateModel: function(json){
		var model = new sap.ui.model.json.JSONModel(json);
		console.log("update model");
        this.getView().setModel(model);
	},  
    
});