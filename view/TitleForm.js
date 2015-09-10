(function () {
  "use strict";
  jQuery.sap.declare("quicksurvey.view.TitleForm");

  sap.ui.core.Control.extend("quicksurvey.view.TitleForm", {

    // the control API:
    metadata : {
      properties : {
      },
    },

    init : function(){
    },



    renderer : {

      render : function(oRm, oControl) {

        oRm.write("<div");
        oRm.writeControlData(oControl);

        oRm.addClass("titleForm");
        oRm.writeClasses();

        oRm.write(">");

        //content
        oRm.renderControl(oControl.createForm());
        oRm.write("</div>");

      }
    }
  });
}());
