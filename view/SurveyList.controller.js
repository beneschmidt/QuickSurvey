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
  },

  deleteSurvey: function(surveyId){
		var that= this;
		var survey = {
			surveyId: surveyId
		};

		$.ajax({
			url: './deleteSurvey',
			type: 'post',
			//	contentType: "application/json; charset=utf-8",
			success: function (data) {
				console.log("deleted");
				sap.ui.getCore().getEventBus().publish("nav", "to", {
					id : "SurveyList"
				});
			},
			error: function(jqXHR, textStatus, errorThrown) {
				if(jqXHR.readyState === 0){
					console.log("Server unreachable");
				} else {
					console.log("An unknown error occured: "+textStatus);
				}
				sap.ui.getCore().getEventBus().publish("nav", "to", {
					id : "SurveyList"
				});
			},
			data: { survey: survey }
		});
	},

  stopSurvey: function(surveyId){
		var that= this;
		var survey = {
			surveyId: surveyId
		};

		$.ajax({
			url: './stopSurvey',
			type: 'post',
			//	contentType: "application/json; charset=utf-8",
			success: function (data) {
				console.log("stopped");
				sap.ui.getCore().getEventBus().publish("nav", "to", {
					id : "SurveyList"
				});
			},
			error: function(jqXHR, textStatus, errorThrown) {
				if(jqXHR.readyState === 0){
					console.log("Server unreachable");
				} else {
					console.log("An unknown error occured: "+textStatus);
				}
				sap.ui.getCore().getEventBus().publish("nav", "to", {
					id : "SurveyList"
				});
			},
			data: { survey: survey }
		});
	}

});
