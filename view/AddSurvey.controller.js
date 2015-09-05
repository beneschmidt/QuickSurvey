sap.ui.controller("quicksurvey.view.AddSurvey", {

	/**
	* Called when a controller is instantiated and its View controls (if available) are already created.
	* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	* @memberOf view.NewFeatures-v122
	*/
	onInit: function() {
		jQuery.sap.require("sap.ui.model.json.JSONModel");
		this.clearModel();

		//this.getView().setModel(new sap.ui.model.json.JSONModel("model/coffee.json"), "coffee");
		this.bus = sap.ui.getCore().getEventBus();
	},

  updateModel: function(json){
    var model = new sap.ui.model.json.JSONModel(json);
    this.getView().setModel(model);
  },

	clearModel: function(){
		var input = {
			title   : "",
			answersChangable   : false,
		};

		var model = new sap.ui.model.json.JSONModel(input);
		sap.ui.getCore().setModel(model, "input");
		this.getView().setModel(model, "input");
	},

	doNavBack: function(event) {
		this.bus.publish("nav", "back");
	},

	addSurvey: function(event){
		var controller = this;
		var model = this.getView().getModel("input");
		console.log(model);
		var that= this;
		var survey = {
			name : model.getProperty("/title"),
			answersChangable : model.getProperty("/answersChangable")
		};

		$.ajax({
			url: './addNewSurvey',
			type: 'post',
			//	contentType: "application/json; charset=utf-8",
			success: function (data) {
				controller.clearModel();
			},
			error: function(jqXHR, textStatus, errorThrown) {
				if(jqXHR.readyState === 0){
					console.log("Server unreachable");
				} else {
					console.log("An unknown error occured: "+textStatus);
				}
				controller.clearModel();
			},
			data: { survey: survey }
		});
	}
	/**
	* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
	* (NOT before the first rendering! onInit() is used for that one!).
	* @memberOf view.NewFeatures-v122
	*/
	//	onBeforeRendering: function() {
	//
	//	},

	/**
	* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
	* This hook is the same one that SAPUI5 controls get after being rendered.
	* @memberOf view.NewFeatures-v122
	*/
	//	onAfterRendering: function() {
	//
	//	},

	/**
	* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
	* @memberOf view.NewFeatures-v122
	*/
	//	onExit: function() {
	//
	//	}

});
