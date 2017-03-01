var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var cors = require('cors')


/**
* Setup DB connection
*/
var pool      =    mysql.createPool({
    connectionLimit : 100, //important
    host     : 'fivestonetcad2.cusgdaffdgw5.us-west-2.rds.amazonaws.com',
    user     : 'dgDBMaster',
    password : '2x5Z3xF8t15F',
    database : 'tcad_2016',
    debug    :  false
});

function handle_database(req,res) {

    pool.getConnection(function(err,connection){
        if (err) {
          res.json({"code" : 100, "status" : "Error in connection database"});
          return;
        }

        console.log('connected as id ' + connection.threadId);

        connection.query("select * from BATCH_PROP_SETTINGS WHERE id=(SELECT max(id) FROM BATCH_PROP_SETTINGS)",function(err,rows){
            connection.release();
            if(!err) {
                res.json(rows[0]);
            }
        });

        connection.on('error', function(err) {
              res.json({"code" : 100, "status" : "Error in connection database"});
              return;
        });
  });
}

/* GET users listing. */
router.get('/real', function(req, res, next) {
  handle_database(req,res);
});

/* GET sample settings */
router.get('/', cors(), function(req, res, next) {
  res.type('json');
  res.send({
    "id": 30,
    "TrimIndicated": 1,
    "MultiHood": 0,
    "IncludeVU": 0,
    "IncludeMLS": 0,
    "NumPrevYears": 1,
    "SqftRange": 10,
    "ClassRange": 1,
    "ClassRangeEnabled": 1,
    "PercentGood": 10,
    "PercentGoodEnabled": 1,
    "NetAdj": 0,
    "NetAdjEnabled": 0,
    "ImpLimit": 0
    });
});

module.exports = router;
