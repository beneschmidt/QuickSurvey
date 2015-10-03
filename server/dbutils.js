module.exports = {
  extractFullSurveyList : function(rows, log){
    var sid, qid;
    var objects = [];
    var spos = -1, qpos = -1;
    // multiple rows are parsed into surveys
    // there might be multiple surveys, so you also have to check if the survey id
    // has changed. This only works if the sql is sorted correctly
    for(var i = 0; i <rows.length; i++){
      var current = rows[i];
      // new survey, if the survey id has changed
      if(sid!=current.sid){
        sid=current.sid;
        spos++;
        qpos = -1;
        objects[spos] = {
          objectId : current.sid,
          name : current.name,
          questions:[],
          startedat: current.startedat,
          changeanswers: current.changeanswers,
          finishat: current.finishat
        }
      }
      // new question in the current survey, if the question id has changed
      if(qid!= current.qid){
        qpos++;
        qid = current.qid;
        objects[spos].questions.push({
          objectId: current.qid,
          questiontext: current.questiontext,
          multiple: current.multiple,
          answers: [],
          type: current.type
        });
      }
      // new answer in the current question, if the answer id has changed
      if(objects[spos].questions[qpos]){
        objects[spos].questions[qpos].answers.push({
          objectId: current.aid,
          answertext : current.answertext,
          count : current.count,
          overallanswercount : current.overallanswercount,
          freetext: current.freetext
        });
      }
    }
    var fullList = {
      Survey: objects
    }
    return fullList;
  },

  executeUpdateMultipleSQL: function(sqlArray, paramArray, log, callback){
    // update process of multiple sqls
    // the sql array contains the sqls, the param array their parameters (same index)
    var that = this;
    var counter = 0;
    var innerCallback = function(sqlOK){
      if(!sqlOK){
        log.error("found an error: "+sqlOK);
        callback(sqlOK);
      } else {
        counter++;
        if(counter === sqlArray.length){
          log.info("All "+counter+" were inserted!");
          callback(true);
        } else {
          // recursive callback call of the sql update
          this.executeUpdateSQL(sqlArray[counter], paramArray[counter], log, innerCallback);
        }
      }
    }
    this.executeUpdateSQL(sqlArray[counter], paramArray[counter], log, innerCallback);
  },

  executeUpdateSQL : function(sql, params, log, callback){
    // only for updates
    this.log = log;
    var that = this;
    var pg = require('pg');

    var conString = "postgres://quicksurvey:quicksurvey@localhost:5432/quicksurvey";
    var oClient = new pg.Client(conString);
    this.result = [];
    var dbutils = require("./dbutils.js");
    log.info("SQL to execute "+sql);
    this.callback = callback;

    pg.connect(conString, function(err, client, done) {

      var handleError = function(err) {
        // no error occurred, continue with the request
        if(!err) return false;
        that.log.error(err);

        // An error occurred, remove the client from the connection pool.
        // A truthy value passed to done will remove the connection from the pool
        // instead of simply returning it to be reused.
        // In this case, if we have successfully received a client (truthy)
        // then it will be removed from the pool.
        if(client){
          done(client);
        }

        return true;
      };


      // handle an error from the connection
      if(handleError(err)) {
        that.callback(false);
        return;
      };
      client.query(sql, params, function(err, result) {
        // handle an error from the query
        if(handleError(err)) {
          that.callback(false);
          return;
        };
        // return the client to the connection pool for other requests to reuse
        done();
        that.callback(true);
        return;
      });
    });
  },

  executeSelectSQL: function(select, params, log, callback){
    // only for selects
    this.log = log;
    this.callback = callback;
    var that = this;

    var pg = require('pg');

    var conString = "postgres://quicksurvey:quicksurvey@localhost:5432/quicksurvey";
    var oClient = new pg.Client(conString);
    var constraint;
    this.result = [];
    var dbutils = require("./dbutils.js");

    oClient.connect(function(err) {
      var handleError = function(err) {
        // no error occurred, continue with the request
        if(!err) return false;
        that.log.error(err);

        // An error occurred, remove the client from the connection pool.
        // A truthy value passed to done will remove the connection from the pool
        // instead of simply returning it to be reused.
        // In this case, if we have successfully received a client (truthy)
        // then it will be removed from the pool.
        if(client){
          done(client);
        }

        return true;
      };


      if(handleError(err)) {
        that.callback(null, error);
        return;
      };

      var query = oClient.query(select, params);
      query.on('row', function(row) {
        that.result.push(row);
      });
      query.on('end', function(result) {
        if(result.rowCount===0){
          that.log.info("no row received!");
          that.callback(that.result);
          oClient.end();
        } else {
          that.callback(that.result);
          oClient.end();
        }
      });
    });
  },

/*
  getNextId : function(callback, table, log){
    var dbutils = require("./dbutils.js");
    var sql = "SELECT MAX(id) AS id FROM "+table;
    var surveyCallback = function(result, error){
      if(error){
        log.error("error: "+error)
        return;
      } else {
        callback(result[0].id +1);
      }
    }
    dbutils.executeSelectSQL(sql, [], log, surveyCallback);
  },*/
}
