var express = require('express');
var router = express.Router();
var cors = require('cors')

var db = require('../lib/db.js');
var Property = require('../models/property.js');
var Improvement = require('../models/improvement.js');
var Land = require('../models/wcad/tsgland.js');

var wcadPropDao = require('../lib/wcadPropDao');

router.get('/', cors(), function(req, res, next) {
  res.type('json');
  res.send("OK");
});

router.get('/alive', cors(), function(req, res, next) {
  db.sequelize
  .authenticate()
  .then(err => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
  res.type('json');
  res.send('OK');
})

router.get('/propertyByQuickRefId/:quickRefId', cors(), function(req, res, next) {
  const quickRefId = req.params['quickRefId'];
  console.log('Searching for', quickRefId);

  wcadPropDao.getPropertyByQuickRefId(quickRefId)
    .then(wcadProp => {
      //console.log("wcadProp:",wcadProp);
      res.json(wcadProp);
    }).catch(error => {
      console.log("ERROR:", error);
      res.status(500).send('Something broke!');
    });
})

router.get('/comps/:quickRefId', cors(), function(req, res, next){
  const quickRefId = req.params['quickRefId'];
  const sqftRangePct = req.query['sqftRangePct'];

  const percAboveBelow = sqftRangePct ? sqftRangePct : 10;
  console.log('Finding comps for quickRefId=',quickRefId,
              'at percAboveBelow=',percAboveBelow);
  const percAbove = 1 + (percAboveBelow / 100);
  const percBelow = 1 - (percAboveBelow / 100);

  result = {"subject" : "", "comps" : ""};

  wcadPropDao.getPropertyByQuickRefId(quickRefId)
    .then(property => {
      const subj = property.property;
      console.log("Found subj=", subj.get('quickRefId'));
      result.subject = subj;

      const subjHood = subj.get('NeighborhoodCode');
      const subjLivingArea = subj.get('TotalSqFtLivingArea');
      Property.findAll({
        where : {
          NeighborhoodCode : subjHood,
          TotalSqFtLivingArea : {
            $and: {
              $lt : subjLivingArea * percAbove,
              $gt : subjLivingArea * percBelow
            }
          }
        }
      }).then(possibleComps => {
        //console.log("PossibleComps = ", possibleComps.length);
        //result.push({"comps" : possibleComps});
        result.comps = possibleComps;
        res.json(result);
      })
  }).catch(error => {
      console.log("ERROR:", error);
      res.status(500).send('Something broke!');
    });
})

module.exports = router;
