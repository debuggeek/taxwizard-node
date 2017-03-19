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

/* GET users listing. */
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

router.get('/all', function(req, res, next) {
  var limit=10;
  var page=(typeof req.params.page!='undefined')?parseInt(req.params.page):1;
  var start=(page-1)*limit;

  var findings=[];
  // var test = {};
  // test.propid = "1";
  // findings.push(test);
// LIMIT % OFFSET %", limit, start)
  db.connection.query("SELECT * FROM `BATCH_PROP` LIMIT ? OFFSET ?", [limit, start])
            .on('result', function (row, findings) {
            //  console.log("row=",row);
              var finding={};
              finding.propId = row['prop'];
              findings.push(finding);
            })
            .on('error', function (err) {
              callback({error: true, err: err});
            });
  // res.type('json');
  console.log("findings=", findings);
  res.send(findings);
});

module.exports = router;
