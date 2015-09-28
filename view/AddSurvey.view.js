jQuery.sap.require("sap.ui.layout.form.SimpleForm");

sap.ui.jsview("quicksurvey.view.AddSurvey", {

	/**
	* Specifies the Controller belonging to this View. In the case that it is
	* not implemented, or that "null" is returned, this View does not have a
	* Controller.
	*
	* @memberOf view.NewFeatues-v122
	*/
	getControllerName : function() {
		return "quicksurvey.view.AddSurvey";
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
			tooltip : "{i18n>BACK_TO_SURVEY_LIST}",
			press : function(ev) {
				sap.ui.getCore().getEventBus().publish("nav", "to", {id : "SurveyList"});
			}
		});
		var page =  new sap.m.Page({
			title : "{i18n>ADD_SURVEY}",
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
			id : "AddSurvey"
		});
	},

	getCurrentForm : function(){
		if(this.getModel("info")){
			var currentCounter = this.getCurrentCounter();
			if(currentCounter === -1){
				return this.createTitleForm();
			} else {
				return this.createFormForType(this.getModel("survey").getProperty("/questions/"+currentCounter+"/type"));
			}
		}
	},

	createFormForType:function(type, position){
		// type 1: ja/nein
		// type 2: grades
		switch(type){
			case 1: {
				return this.createQuestionForm("Yes/No question");
			}
			case 2: {
				// create grades
				return this.createQuestionForm("Grades question");
			}
			case 3: {
				// create grades
				return this.createSelectionForm("Single selection", false);
			}
			case 4: {
				// create grades
				return this.createSelectionForm("Mutliple selection", true);
			}
			case 5: {
				// create grades
				return this.createFreeTextForm();
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

	createTitleForm: function(){
		var oForm = this.createForm();
		var oTitle = new sap.m.Input({
			value: {
				path: "survey>/title"
			}
		});
		var oTitleLabel = new sap.m.Label({
			text : "{i18n>SURVEY_TITLE}",
			labelFor : oTitle
		});
		oForm.addContent(oTitleLabel);
		oForm.addContent(oTitle);
		var that = this;

		// change answers
		var oChangeAnswers = new sap.m.ToggleButton({
			pressed: {path: "survey>/answersChangable"},
			press : function(evt){
				if (evt.getSource().getPressed()){
					this.getModel("survey").setProperty("/answersChangable", true);
					oChangeAnswers.setText("Yes");
				} else {
					this.getModel("survey").setProperty("/answersChangable", false);
					oChangeAnswers.setText("No");
				}
			}
		});
		oChangeAnswers.bindProperty("text", "survey>/answersChangable", function(changable) {
			if (changable) {
				return "Yes"
			} else{
				return "No";
			}
		});
		var oChangeAnswersLabel = new sap.m.Label({
			text : "{i18n>ANSWERS_CHANGABLE}",
			labelFor : oChangeAnswers
		});
		oForm.addContent(oChangeAnswersLabel);
		oForm.addContent(oChangeAnswers);

		return oForm;
	},

	createSelectionForm: function(title, multiple){
		var oForm = this.createForm();
		var oTitleLabel = new sap.m.Label({
			text : title,
		});
		oForm.addContent(oTitleLabel);
		var currentCounter = this.getCurrentCounter();
		var oQuestionText = new sap.m.Input({
			value: {
				path: "survey>/questions/"+currentCounter+"/questiontext"
			}
		});

		var oQuestionTextLabel = new sap.m.Label({
			text : "{i18n>QUESTION_TEXT}",
			labelFor : oQuestionText
		});
		oForm.addContent(oQuestionTextLabel);
		oForm.addContent(oQuestionText);

		var oAnswerList = new sap.m.ListBase();
		oAnswerList.bindAggregation("items", "survey>/questions/"+currentCounter+"/answers", function(sId, oContext) {
			var value = oContext.getProperty("answertext");
			var removeButton = new sap.m.Button({
				icon : "sap-icon://sys-cancel",
				visible: oContext.getModel().getProperty(oContext.getPath().substring(0, oContext.getPath().lastIndexOf("/"))).length > 2,
				press: function(){
					var path = oContext.getPath().substring(0, oContext.getPath().lastIndexOf("/"));
					var currentIndex = oContext.getPath().substring(oContext.getPath().lastIndexOf("/")+1)  ;
					var array = oContext.getModel().getProperty(path);
					array.splice(currentIndex, 1);
					oContext.getModel().setProperty(path, array);
				}
			});
			var addButton = new sap.m.Button({
				icon : "sap-icon://sys-add",
				press: function(){
					var path = oContext.getPath().substring(0, oContext.getPath().lastIndexOf("/"));
					var nextIndex = oContext.getPath().substring(oContext.getPath().lastIndexOf("/")+1) + 1;
					var array = oContext.getModel().getProperty(path);
					array.splice(nextIndex, 0, {answertext:""});
					oContext.getModel().setProperty(path, array);
				}
			});
			var inputField = new sap.m.Input({
				value: value,
				width: "100%"
			}).addStyleClass("multipleListItemInput")
			.attachLiveChange(function(oControlEvent){
				oContext.getModel().setProperty(oContext.getPath()+"/answertext", oControlEvent.getParameters().value);
			});
			var flexBox = new sap.m.FlexBox({
				justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
				direction: sap.m.FlexDirection.Row,
				alignItems: sap.m.FlexAlignItems.Start,
				items: [inputField, addButton, removeButton]
			}).addDelegate({
				onAfterRendering: function(){
					$("#"+flexBox.getId())[0].children[0].classList.add("fullWidthTextField");
				}
			});
			return new sap.m.CustomListItem({
				content: [flexBox],
			});
		});
		var oAnswersLabel = new sap.m.Label({
			text : multiple?"{i18n>MULTIPLE_ANSWERS}": "{i18n>ANSWERS}",
			labelFor : oAnswerList
		});
		oForm.addContent(oAnswersLabel);
		oForm.addContent(oAnswerList);

		return oForm;
	},

	createQuestionForm: function(title){
		var oForm = this.createForm();
		var oTitleLabel = new sap.m.Label({
			text : title
		});
		oForm.addContent(oTitleLabel);
		var currentCounter = this.getCurrentCounter();
		var oQuestionText = new sap.m.Input({
			value: {
				path: "survey>/questions/"+currentCounter+"/questiontext"
			}
		});

		var oQuestionTextLabel = new sap.m.Label({
			text : "{i18n>QUESTION_TEXT}",
			labelFor : oQuestionText
		});
		oForm.addContent(oQuestionTextLabel);
		oForm.addContent(oQuestionText);

		var oAnswerList = new sap.m.ListBase();
		oAnswerList.bindAggregation("items", "survey>/questions/"+currentCounter+"/answers", function(sId, oContext) {
			var value = oContext.getProperty("answertext");
			return new sap.m.StandardListItem({
				title: value,
			});
		});
		var oAnswersLabel = new sap.m.Label({
			text : "{i18n>ANSWERS}",
			labelFor : oAnswerList
		});
		oForm.addContent(oAnswersLabel);
		oForm.addContent(oAnswerList);

		return oForm;
	},

	createFreeTextForm: function(){
		var oForm = this.createForm();
		var oTitleLabel = new sap.m.Label({
			text : "{i18n>FREE_TEXT}"
		});
		oForm.addContent(oTitleLabel);
		var currentCounter = this.getCurrentCounter();
		var oQuestionText = new sap.m.Input({
			value: {
				path: "survey>/questions/"+currentCounter+"/questiontext"
			}
		});

		var oQuestionTextLabel = new sap.m.Label({
			text : "{i18n>QUESTION_TEXT}",
			labelFor : oQuestionText
		});
		oForm.addContent(oQuestionTextLabel);
		oForm.addContent(oQuestionText);
		var that = this;

		// change answers
		var oAnswer = new sap.m.TextArea({
			enabled: false,
			value: {
				path: "survey>/questions/"+currentCounter+"/answers/0/answertext"
			}
		});
		var oAnswerLabel = new sap.m.Label({
			text : "{i18n>FREE_TEXT_ANSWER}",
			labelFor : oAnswer
		});
		oForm.addContent(oAnswerLabel);
		oForm.addContent(oAnswer);

		return oForm;
	},

	createSelectDialogCombo: function(){
		var that = this;
		// add new question dialog
		var listItemYesNo = new sap.m.StandardListItem({
			title: "{i18n>YES_NO}",
			customData:[new sap.ui.core.CustomData({key: "type", value: 1}),
			new sap.ui.core.CustomData({key: "multiple", value: false}),
			new sap.ui.core.CustomData({key: "items", value: [{answertext:"Yes"}, {answertext:"No"}]})]
		});
		var listItemGrades = new sap.m.StandardListItem({
			title: "{i18n>GRADES}",
			customData:[new sap.ui.core.CustomData({key: "type", value: 2}),
			new sap.ui.core.CustomData({key: "multiple", value: false}),
			new sap.ui.core.CustomData({key: "items", value: [{answertext: "1"},{answertext:"2"},{answertext:"3"},{answertext:"4"},{answertext:"5"}]})]
			//new sap.ui.core.CustomData({key: "items", value: [{test: "0",answertext: "one"},{test: "1",answertext:"two"}]})]
		});
		var listItemSingleSelection = new sap.m.StandardListItem({
			title: "{i18n>SINGLE_SELECTION}",
			customData:[new sap.ui.core.CustomData({key: "type", value: 3}),
			new sap.ui.core.CustomData({key: "multiple", value: false}),
			new sap.ui.core.CustomData({key: "items", value: [{answertext: ""},{answertext:""}]})]
			//new sap.ui.core.CustomData({key: "items", value: [{test: "0",answertext: "one"},{test: "1",answertext:"two"}]})]
		});
		var listItemMultipleSelection = new sap.m.StandardListItem({
			title: "{i18n>MULTIPLE_SELECTION}",
			customData:[new sap.ui.core.CustomData({key: "type", value: 4}),
			new sap.ui.core.CustomData({key: "multiple", value: true}),
			new sap.ui.core.CustomData({key: "items", value: [{answertext: ""},{answertext:""}]})]
			//new sap.ui.core.CustomData({key: "items", value: [{test: "0",answertext: "one"},{test: "1",answertext:"two"}]})]
		});
		var listItemFreeText = new sap.m.StandardListItem({
			title: "{i18n>FREE_TEXT}",
			customData:[new sap.ui.core.CustomData({key: "type", value: 5}),
			new sap.ui.core.CustomData({key: "multiple", value: false}),
			new sap.ui.core.CustomData({key: "items", value: [{answertext: "free text"}]})]
			//new sap.ui.core.CustomData({key: "items", value: [{test: "0",answertext: "one"},{test: "1",answertext:"two"}]})]
		});
		var oSelectDialog = new sap.m.SelectDialog({
			title: "{i18n>ADD_NEW_QUESTION}",
			noDataText: "Nothing possible",
			items : [listItemYesNo, listItemGrades, listItemSingleSelection, listItemMultipleSelection, listItemFreeText],
			confirm: function(evt){
				var nextCounter = that.getCurrentCounter()+1;
				var customData = evt.getParameters().selectedItems[0].getCustomData();
				var type =customData[0].getProperty("value");
				var multiple = customData[1].getProperty("value");
				var items = customData[2].getProperty("value");
				var question = {
					type: type,
					questiontext: "",
					multiple: multiple,
					answers: items
				};
				var arr = that.getModel("survey").getProperty("/questions");
				arr.splice(nextCounter, 0 , question);
				that.getModel("survey").setProperty("/questions", arr);
				that.nextView();
			}
		});

		var oSelectDialogLabel = new sap.m.Label({
			text : "{i18n>ADD_NEW_QUESTION}",
			labelFor : oSelectDialog
		});
		var oSelectDialogBtn = new sap.m.Button({
			icon : "sap-icon://add",
			visible : quicksurvey.app.config.LaunchpadMode,
			tooltip : "{i18n>CREATE_NEW_QUESTION}",
			press : function(ev) {
				oSelectDialog.open();
			}
		});

		var object = {
			button: oSelectDialogBtn,
			label: oSelectDialogLabel
		};
		return object;
	}

});
