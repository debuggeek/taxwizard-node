const express = require('express');
const router = express.Router();
const cors = require('cors');

const db = require('../lib/db.js');


router.get('/', cors(), function(req, res) {
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

router.get('/total', function(req, res) {
  db.connection.query("SELECT COUNT(1) FROM `BATCH_PROP`")
            .on('result', function (row) {
              res.json(row['COUNT(1)']);
            })
            .on('error', function (err) {
              callback({error: true, err: err});
            });
});

router.get('/unprocessed', function(req, res) {
  db.connection.query("SELECT COUNT(1) FROM `BATCH_PROP` WHERE completed = false")
            .on('result', function (row) {
              res.json(row['COUNT(1)']);
            })
            .on('error', function (err) {
              callback({error: true, err: err});
            });
});

router.get('/processed', function(req, res) {
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
        const results = qResults[0];
        resolve(results);
    }).catch(error => {
      console.log(error);
      reject(error);
    });
  });
}

router.get('/settings', function(req, res) {
  const settingsPromise = new Promise((resolve,reject) => {
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
  for (let field in source) {
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

    const update = updateJson;
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

router.get('/all', function(req, res) {
    const limit=10000;
    const page=(typeof req.params.page!=='undefined')?parseInt(req.params.page):1;
    const start=(page-1)*limit;

  qPromise = db.conn.queryPromise("SELECT prop,prop_mktval,Median_Sale5,Median_Sale10,Median_Sale15," +
        "Median_Eq11,TotalComps FROM `BATCH_PROP` WHERE completed = 'true' LIMIT ? OFFSET ?", [limit, start]);
  qPromise.then(qResults => {
    console.log(qResults.length + " entries in BATCH_PROP");
    res.json(qResults);
  }).catch(error => {
    console.log(error);
  });
});

router.get('/pdf/:propId', function(req, res) {
    const propId = (typeof req.params.propId!=='undefined')?parseInt(req.params.propId):null;

    if(propId === null){
        res.status(400).send('Must provide propId');
    }

    console.log("Getting PDF for " + propId);

    let qPromise = db.conn.queryPromise("SELECT pdfs FROM BATCH_PROP WHERE prop=?", [propId]);
    qPromise.then(qResults => {
        console.log(qResults.length + " results found");
        //2 step conversion from SQL chars to the base64 encoding that it is
        let data = Buffer.from(qResults[0]['pdfs']).toString();
        let d2 = Buffer.from(data,'base64');
        res.writeHead(200, {
            'Content-Type': 'application/pdf;base64',
            'Content-Disposition': 'attachment; filename='+propId+'.pdf',
            'Content-Length': d2.length
        });
        res.end(d2);
    }).catch(error => {
        console.log(error);
        res.status(500).send(error);
    });
});

module.exports = router;
