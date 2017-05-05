var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var cors = require('cors')

var db = require('../lib/db.js');

var BATCHPROP = "tcad_general.BATCH_PROP";

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
  db.connection.query("SELECT COUNT(1) FROM `${BATCHPROP}`")
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
                                                          "SqftRangePctEnabled, SqftRangePct,SqftRangeMin,SqftRangeMax,"+
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
      var results = qResults[0];
      //console.log("getCurrBatchSettings results=", results);
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
    res.json(qResults);
  }).catch(error => {
    console.log(error);
  });
});

function getColName(string){
  let colMap = {'onlyLowerComps':'TrimIndicated','multiHood':'MultiHood,','includeVU':'IncludeVU', 'mlsMultiYear':'NumPrevYears',
      'useSqftRangePct':'SqftRangePctEnabled','sqftRangePct':'SqftRangePct','sqftRangeMin':'SqftRangeMin','sqftRangeMax':'SqftRangeMax',
      'subClassRange':'ClassRange', 'subClassRangeEnabled':'ClassRangeEnabled',
      'ratiosEnabled':'SaleRatioEnabled','saleRatioMin':'SaleRatioMin','saleRatioMax':'SaleRatioMax',
      'pctGoodRange':'PercentGood','pctGoodRangeEnabled':'PercentGoodEnabled','pctGoodMin':'PercentGoodMin','pctGoodMax':'PercentGoodMax',
      'netAdjustAmt':'NetAdj','netAdjEnabled':'NetAdjEnabled',
      'limitImps':'ImpLimit',
      'tcadScoreLimitEnabled':'LimitTcadScores','tcadScoreLimitPct':'LimitTcadScoresAmount','tcadScoreLimitMin':'TcadScoreLimitMin','tcadScoreLimitMax':'TcadScoreLimitMax',
      'onlyCurrYearLowered':'LimitToCurrentYearLowered', 'grossAdjEnabled':'GrossAdjFilterEnabled',
      'showTcadScores':'ShowTcadScores'};

  if(colMap.hasOwnProperty(string)){
    return colMap[string];
  }

  console.log("No column found to match ", string);
  return '';
}

function copyFields(target, source) {
  let tracing = true;
  for (var field in source) {
    let colName = getColName(field);
    if(tracing) console.log("Looking for " + field + " with colName " + colName);
    if (target.hasOwnProperty(colName)) {
      if(tracing) console.log("Found field " + colName);
      target[colName] = source[field];
    }
  }
  if(tracing) console.log("copyFields target", target);
}

router.post('/settings', function(req,res) {
  let updateProm = getCurrBatchSettings();

  updateProm.then(updateJson => {
    let tracing = false;

    var update = updateJson;
    if(tracing) console.log("update=", update);
    let postData = req.body;
    if(tracing) console.log("postData=", postData);
    copyFields(update, postData);
    if(tracing) console.log("updatePostCopy=", update);
    update.TrimIndicated = 0;
    settingsPromise = db.conn.queryPromise("INSERT INTO BATCH_PROP_SETTINGS " +
                      "SET TrimIndicated = ?, MultiHood = ?, IncludeVU = ?, IncludeMLS = ?, NumPrevYears = ?, " +
                      "SqftRangePctEnabled = ?, SqftRangePct = ?, SqftRangeMin = ?, SqftRangeMax = ?," +
                      "ClassRange = ?, ClassRangeEnabled = ?," +
                      "SaleRatioEnabled = ?, SaleRatioMin = ?, SaleRatioMax = ?, " +
                      "PercentGood = ?, PercentGoodEnabled = ?, PercentGoodMin = ?, PercentGoodMax = ?, " +
                      "NetAdj = ?, NetAdjEnabled = ?, ImpLimit = ?, "+
                      "LimitTcadScores = ?, LimitTcadScoresAmount = ?, TcadScoreLimitMin = ?, TcadScoreLimitMax = ?, "+
                      "LimitToCurrentYearLowered = ?, GrossAdjFilterEnabled = ?, " +
                      "ShowTcadScores = ?, ShowSaleRatios = ?",
                      [
                        update.TrimIndicated, update['MultiHood'], update['IncludeVU'], update['IncludeMLS'], update['NumPrevYears'],
                        update.SqftRangePctEnabled, update.SqftRangePct, update.SqftRangeMin, update.SqftRangeMax,
                        update.ClassRange, update.ClassRangeEnabled,
                        update.SaleRatioEnabled, update.SaleRatioMin, update.SaleRatioMax,
                        update.PercentGood, update.PercentGoodEnabled, update.PercentGoodMin, update.PercentGoodMax,
                        update.NetAdj, update.NetAdjEnabled, update.ImpLimit,
                        update.LimitTcadScores,  update.LimitTcadScoresAmount, update.TcadScoreLimitMin, update.TcadScoreLimitMax,
                        update.LimitToCurrentYearLowered, update.GrossAdjFilterEnabled,
                        update.ShowTcadScores, update.ShowSaleRatios
                      ]
                      );
    settingsPromise.then(qResults => {
      console.log("settingsPromise", qResults);
      res.json(qResults);
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
