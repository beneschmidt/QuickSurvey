jQuery.sap.require("sap.ui.layout.form.SimpleForm");
jQuery.sap.require("sap.ui.unified.Calendar");
jQuery.sap.require("sap.ui.unified.DateRange");

sap.ui.jsview("quicksurvey.view.AnalyseSurvey", {

	/**
	* Specifies the Controller belonging to this View. In the case that it is
	* not implemented, or that "null" is returned, this View does not have a
	* Controller.
	*
	* @memberOf view.NewFeatues-v122
	*/
	getControllerName : function() {
		return "quicksurvey.view.AnalyseSurvey";
	},

	/**
	* Is initially called once after the Controller has been instantiated. It
	* is the place where the UI is constructed. Since the Controller is given
	* to this method, its event handlers can be attached right away.
	*
	* @memberOf view.NewFeatues-v122
	*/
	createContent : function(oController) {
		var that = this;

		var oBtnLaunchpad = new sap.m.Button({
			icon : "sap-icon://home",
			visible : quicksurvey.app.config.LaunchpadMode,
			tooltip : "Back to Home",
			press : function(ev) {
				sap.ui.getCore().getEventBus().publish("nav", "to", {id : "Launchpad"});
			}
		});
		var page =  new sap.m.Page({
			title : "{info>/title}",
			showNavButton: "{device>/isPhone}",
			headerContent:[oBtnLaunchpad],
			navButtonPress: [oController.doNavBack, oController]
		});
		this.page = page;
		return page;
	},

	getCurrentCounter:function(){
		return this.getModel("info").getProperty("/counter");
	},

	nextView : function(){
		this.navToView(+1);
	},

	previousView : function(){
		this.navToView(-1);
	},

	navToView:function(viewDirection){
		this.getModel("info").setProperty("/counter", this.getCurrentCounter()+viewDirection);
		sap.ui.getCore().getEventBus().publish("nav", "to", {
			id : "AnalyseSurvey"
		});
	},

	getCurrentForm : function(){
		if(this.getModel("info")){
			var currentCounter = this.getCurrentCounter();
			var questionText = this.getModel("survey").getProperty("/questions/"+currentCounter+"/questiontext");
			this.getModel("info").setProperty("/title", this.getModel("survey").getProperty("/title"));
			return this.createFormForType(this.getModel("survey").getProperty("/questions/"+currentCounter+"/type"), questionText);
		}
	},

	createFormForType:function(type, questionText){
		// type 1: ja/nein
		// type 2: grades
		switch(type){
			case 1: {
				return this.createQuestionForm(questionText);
			}
			case 2: {
				// create grades
				return this.createQuestionForm(questionText);
			}
			default: {
				// not sure
			}
		}
	},

	createForm: function(){
		return new sap.ui.layout.form.SimpleForm({
			maxContainerCols: 2,
			editable        : true,
			layout          : "ResponsiveGridLayout",
			//title           : "Date Controls",
			labelSpanL : 4,
			labelSpanM : 4,
			emptySpanL : 1,
			emptySpanM : 1,
			columnsL   : 1,
			columnsM   : 1
		});
	},

	createQuestionForm: function(){
		var currentCounter = this.getCurrentCounter();
		var that = this;
		var layout = new sap.m.FlexBox({
			direction: sap.m.FlexDirection.Column,
			alignItems: sap.m.FlexAlignItems.Center
		});

		var oQuestionText = new sap.m.Text({
			text: {
				path: "survey>/questions/"+currentCounter+"/questiontext"
			},
			textAlign: sap.ui.core.TextAlign.Center
		});
		oQuestionText.addStyleClass("questionTitle");
		layout.addItem(oQuestionText);

		var flexBox = new sap.m.FlexBox({
			height: "100%",
			width: "100%",
			justifyContent: "Center"
		}).addDelegate({
			onAfterRendering: function(){
				var dataset = that.getModel("survey").getProperty("/questions/"+currentCounter+"/answers");
				var max = 0;
				for(var i = 0; i < dataset.length; i++){
					max = Math.max(max, dataset[i].count);
				}
				var w = 400;
				var boxDOM = $("#"+that.page.getId())[0];
				var h = boxDOM.offsetHeight-120;
				var barPadding = 1;
				var yOffset = max>0?(h-20)/max:1;

				//Create SVG element
				var svg = d3.select(".d3")
				.append("svg")
				.attr("width", w)
				.attr("height", h);

				svg.selectAll("rect")
				.data(dataset)
				.enter()
				.append("rect")
				.attr("x", function(d, i) {
					return i * (w / dataset.length);
				})
				.attr("y", function(d) {
					return h - (d.count * yOffset) - 2;
				})
				.attr("width", w / dataset.length - barPadding)
				.attr("height", function(d) {
					return d.count * yOffset + 2;
				})
				.attr("fill", "teal");

				// Text
				svg.selectAll("text")
				.data(dataset)
				.enter()
				.append("text")
				.text(function(d) {
					return d.answertext + " ("+d.count+")";
				})
				.attr("text-anchor", "middle")
				.attr("x", function(d, i) {
					return i * (w / dataset.length) + (w / dataset.length - barPadding) / 2;
				})
				.attr("y", function(d) {
					return h - (d.count * yOffset) -5;
				})
				.attr("font-family", "sans-serif")
				.attr("font-size", "11px");

			}
		});
		flexBox.addStyleClass("d3");

		layout.addItem(flexBox);

		return layout;
	},



	createNextButton: function(currentCounter, numberOfQuestions){
		var oBtnNext = new sap.m.Button({
			icon : "sap-icon://arrow-right",
			tooltip : "next page",
			press : function(ev) {
				oController.getView().nextView();
			}
		});
		oBtnNext.bindProperty("visible", "perform>/performed_questions/"+currentCounter+"/performed_answers", function(answers){
			var hasAlreadySelectedSomething = answers? answers.length>0:false;
			return currentCounter < numberOfQuestions-1 && hasAlreadySelectedSomething;
		});
		return oBtnNext;
	},

	createThanksForm: function(){
		var oForm = new sap.ui.layout.form.SimpleForm({
			editable        : false,
			layout          : "ResponsiveGridLayout",
		});
		this.getModel("info").setProperty("/title", "Thanks");
		//oForm.addContent(oTitleLabel);
		var currentCounter = this.getCurrentCounter();
		var that = this;

		var oThanksText = new sap.m.Title({
			text: "Thank you for participating",
			textAlign: sap.ui.core.TextAlign.Center,
			titleStyle: sap.ui.core.TitleLevel.H2
		});

		var oFinishedText = new sap.m.Title({
			text: "Unfortunately it was already finished",
			textAlign: sap.ui.core.TextAlign.Center,
			visible: {
				path:"info>/alreadyFinished"
			}
		});

		var oImage = new sap.m.Image({
			src: 'img/Smiley_Face.png'
		})
		var oButtonContainer = new sap.m.FlexBox({
			justifyContent: sap.m.FlexJustifyContent.Center,
			alignItems: sap.m.FlexAlignItems.Center,
			items: [oThanksText, oImage, oFinishedText],
			direction: sap.m.FlexDirection.Column
		}).addDelegate({
			onAfterRendering: function () {
				oImage.setHeight(oButtonContainer.$().height() + "px");
			}
		});
		oForm.addContent(new sap.m.Label());
		oForm.addContent(oButtonContainer);

		return oForm;
	},

	createNotPossibleForm: function(title, text){
		var oForm = new sap.ui.layout.form.SimpleForm({
			editable        : false,
			layout          : "ResponsiveGridLayout",
		});
		this.getModel("info").setProperty("/title", title);
		//oForm.addContent(oTitleLabel);
		var currentCounter = this.getCurrentCounter();
		var that = this;

		var oText = new sap.m.Text({
			text: text,
			textAlign: sap.ui.core.TextAlign.Center
		});
		oText.addStyleClass("questionTitle")

		var oImage = new sap.m.Image({
			src: 'img/Smiley_Face.png'
		})
		var oButtonContainer = new sap.m.FlexBox({
			justifyContent: sap.m.FlexJustifyContent.Center,
			alignItems: sap.m.FlexAlignItems.Center,
			items: [oText],
			direction: sap.m.FlexDirection.Column
		}).addDelegate({
			onAfterRendering: function () {
				oImage.setHeight(oButtonContainer.$().height() + "px");
			}
		});
		oForm.addContent(new sap.m.Label());
		oForm.addContent(oButtonContainer);

		return oForm;
	},

});
