var express = require('express');
var router = express.Router();
const SAMPLE = require('../public/sampleSalesGrid.json')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.type('json'); 
  res.send(SAMPLE);
});

module.exports = router;
