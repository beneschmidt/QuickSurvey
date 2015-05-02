jQuery.sap.require("quicksurvey.app.config");

sap.ui.controller("quicksurvey.view.Info", {

    onInit: function() {
        this.bus = sap.ui.getCore().getEventBus();
    },

    doNavBackLaunchpad: function(event) {
        this.bus.publish("nav", "backToPage", {id : "Launchpad"});
    },

    doNavBack: function(event) {
        this.bus.publish("nav", "back");
    } 
});