var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var cors = require('cors')

var db = require('../lib/db.js');


router.get('/', cors(), function(req, res, next) {
  res.type('json');
  res.send({
    "rows" : [
      {
        "propId":1,
        "marketValue":100000,
        "medianSale5":50000,
        "medianSale10":75000,
        "medianSale15":100000,
        "medianEq11":200000,
        "totalComps":20,
        "pdf":"tbd"
      }
    ]
    });
});

router.get('/total', function(req, res, next) {
  db.connection.query("SELECT COUNT(1) FROM `BATCH_PROP`")
            .on('result', function (row) {
              res.json(row['COUNT(1)']);
            })
            .on('error', function (err) {
              callback({error: true, err: err});
            });
});

router.get('/unprocessed', function(req, res, next) {
  db.connection.query("SELECT COUNT(1) FROM `BATCH_PROP` WHERE completed = false")
            .on('result', function (row) {
              res.json(row['COUNT(1)']);
            })
            .on('error', function (err) {
              callback({error: true, err: err});
            });
});

router.get('/processed', function(req, res, next) {
  db.connection.query("SELECT COUNT(1) FROM `BATCH_PROP` WHERE completed = true")
            .on('result', function (row) {
              res.json(row['COUNT(1)']);
            })
            .on('error', function (err) {
              callback({error: true, err: err});
            });
});

function getCurrBatchSettings(){
  return new Promise((resolve, reject) => {
    settingsPromise = db.conn.queryPromise("SELECT TrimIndicated,"+
                                                          "MultiHood,"+
                                                          "IncludeVU,"+
                                                          "IncludeMLS,"+
                                                          "NumPrevYears,"+
                                                          "SqftRangePct,SqftRangeMin,SqftRangeMax,"+
                                                          "ClassRange,ClassRangeEnabled,"+
                                                          "SaleRatioEnabled,SaleRatioMin,SaleRatioMax,"+
                                                          "PercentGood,PercentGoodEnabled,PercentGoodMin,PercentGoodMax,"+
                                                          "NetAdj,NetAdjEnabled,"+
                                                          "ImpLimit,"+
                                                          "LimitTcadScores,LimitTcadScoresAmount,TcadScoreLimitMin,TcadScoreLimitMax,"+
                                                          "LimitToCurrentYearLowered,"+
                                                          "GrossAdjFilterEnabled,"+
                                                          "ShowTcadScores,ShowSaleRatios "+
                                                          "FROM BATCH_PROP_SETTINGS "+
                                                          "WHERE id=(SELECT max(id) FROM BATCH_PROP_SETTINGS)");

    settingsPromise.then(qResults => {
      var results = JSON.stringify(qResults[0]);
      console.log("getCurrBatchSettings results=", results);
      resolve(results);
    }).catch(error => {
      console.log(error);
      reject(error);
    });
  });
}

router.get('/settings', function(req, res) {
  settingsPromise = new Promise((resolve,reject) => {
    resolve(getCurrBatchSettings());
  });
  settingsPromise.then(qResults => {
    console.log(qResults);
    res.json(qResults[0]);
  }).catch(error => {
    console.log(error);
  });
});

function getColName(string){
  switch(string){
    case 'mlsMultiYear':
      return 'NumPrevYears';
    default:
      console.log("No column found to match ", string);
      return '';
  }
}

function copyFields(target, source) {
  for (var field in source) {
    console.log("Looking for " + field);
    let colName = getColName(field);
    if (target.hasOwnProperty("NumPrevYears")) {
      console.log("Found field " + colName);
      target[field] = source[field];
    }
  }
}

router.post('/settings', function(req,res) {
  let updateProm = getCurrBatchSettings();

  updateProm.then(updateJson => {
    let update = JSON.parse(updateJson);
    // console.log("update=", update);
    let postData = req.body;
    copyFields(update, postData);
    // console.log("updatePostCopy=", update);
    update.TrimIndicated = 0;
    settingsPromise = db.conn.queryPromise("INSERT INTO BATCH_PROP_SETTINGS " +
                      "SET TrimIndicated = ?, MultiHood = ?, IncludeVU = ?, IncludeMLS = ?, NumPrevYears = ?",
                      [
                        update.TrimIndicated,
                        update['MultiHood'],
                        update['IncludeVU'],
                        update['IncludeMLS'],
                        update['NumPrevYears']
                      ]
                      );
    settingsPromise.then(qResults => {
      console.log(qResults);
      res.json(qResults[0]);
    }).catch(error => {
      console.log(error);
    });
  });
});

router.get('/summary', function(req, res) {
  let result = {"processed" : null, "unprocessed" : null, "total" : null};
  completedPromise = db.conn.queryPromise("SELECT COUNT(1) FROM `BATCH_PROP` WHERE completed = 'true'");
  uncomplePromise = db.conn.queryPromise("SELECT COUNT(1) FROM `BATCH_PROP` WHERE completed = 'false'");
  totalPromise = db.conn.queryPromise("SELECT COUNT(1) FROM `BATCH_PROP`");
  completedPromise.then(qResults => {
    let count = qResults[0]['COUNT(1)'];
    result.processed = count;
    console.log(result);
    uncomplePromise.then(qResults => {
      let count = qResults[0]['COUNT(1)'];
      result.unprocessed=count;
      console.log(result);
      totalPromise.then(qResults => {
        let count = qResults[0]['COUNT(1)'];
        result.total=count;
        console.log(result);
        res.json(result);
      }).catch(error => {
        console.log(error);
      });
    }).catch(error => {
      console.log(error);
    });
  }).catch(error => {
    console.log(error);
  });

});

router.get('/all', function(req, res, next) {
  var limit=10000;
  var page=(typeof req.params.page!='undefined')?parseInt(req.params.page):1;
  var start=(page-1)*limit;

  var findings=[];

  qPromise = db.conn.queryPromise("SELECT prop,prop_mktval,Median_Sale5,Median_Sale10,Median_Sale15," +
        "Median_Eq11,TotalComps FROM `BATCH_PROP` WHERE completed = 'true' LIMIT ? OFFSET ?", [limit, start]);
  qPromise.then(qResults => {
    console.log(qResults.length + " entries in BATCH_PROP");
    res.json(qResults);
  }).catch(error => {
    console.log(error);
  });
});

module.exports = router;
