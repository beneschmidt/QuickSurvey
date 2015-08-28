module.exports = {
  extractFullSurveyList : function(rows, log){
    var sid, qid;
    var objects = [];
    var spos = -1, qpos = -1;
    for(var i = 0; i <rows.length; i++){
      var current = rows[i];
      if(sid!=current.sid){
        sid=current.sid;
        spos++;
        qpos = -1;
        objects[spos] = {
          objectId : current.sid,
          name : current.name,
          questions:[],
          finished: current.finished,
          startedat: current.startedat,
          runtime: current.runtime,
          changeanswers: current.changeanswers
        }
      } else if(qid!= current.qid){
        qpos++;
        qid = current.qid
        objects[spos].questions.push({
          objectId: current.qid,
          questionText: current.questiontext,
          multiple: current.multiple,
          answers: [],
          type: current.type
        });
      } else {
        objects[spos].questions[qpos].answers.push({
          objectId: current.aid,
          text : current.text
        });
      }
    }
    var fullList = {
      Survey: objects
    }
    return fullList;
  }
}
