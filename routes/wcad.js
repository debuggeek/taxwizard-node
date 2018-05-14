var express = require('express');
var router = express.Router();
var cors = require('cors')

var db = require('../lib/db.js');
var Property = require('../models/property.js');
var Improvement = require('../models/improvement.js');
var Land = require('../models/wcad/tsgland.js');

var wcadPropDao = require('../lib/wcadPropDao');
var wcadFunc = require('../lib/wcadFunctions');

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
      if(error.message === "no property found"){
        console.log("INFO:", error.message);
        res.status(404).send(error.message);
      } else {
        console.log("ERROR:", error);
        res.status(500).send('Something broke!');
      }
    });
})

router.post('/comps/:quickRefId', cors(), function(req, res, next){
    const quickRefId = req.params['quickRefId'];
    const sqftRangePct = req.query['sqftRangePct'];
    const salesComp = req.query['sales'];
    const useSales = salesComp ? salesComp : false;
    let percAbove = 0;
    let percBelow = 0;

    if(req.body.useSqftRangePct){
      const sqftRangePct = req.body.sqftRangePct;
      const percAboveBelow = sqftRangePct ? sqftRangePct : 10;
       percAbove = 1 + (percAboveBelow / 100);
       percBelow = 1 - (percAboveBelow / 100);
    } else {
       percAbove = req.body.sqftRangeMax;
       percBelow = req.body.sqftRangMin;
    }

    console.log(`Finding comps for quickRefId=${quickRefId} at percAbove=${percAbove} percBelow=${percBelow} salesComp=${useSales}`);

    let result = {"subject" : "","comps":[]};

    let context = {"percAbove":percAbove,"percBelow":percBelow};

    wcadPropDao.getPropertyByQuickRefId(quickRefId)
        .then(wcadProp => {
            result.subject = wcadProp.summary;
            return wcadPropDao.getCompsFor(context, quickRefId)
                .then( compList => {
                    let simpleList = [];
                    for(x in compList){
                        simpleList.push(compList[x].quickRefId);
                    }
                    console.log("simpleList:", simpleList);
                    wcadPropDao.getHydratedProps(simpleList)
                        .then( hydratedComps => {
                            let compSummaries = [];
                            for(x in hydratedComps){
                                compSummaries.push(hydratedComps[x].summary);
                            }
                            result.comps = compSummaries;
                            result = wcadFunc.calcDiffsForSales(result);
                            result = wcadFunc.calcIndicatedValue(result);
                            result = wcadFunc.sortComps(result, useSales);
                            res.json(result);
                        }).catch(error => {
                        console.log("HydrateError:", error);
                    })
                });
        }).catch(error => {
        if(error.message === "no property found"){
            console.log("INFO:", error.message);
            res.status(404).send(error.message);
        } else {
            console.log("ERROR:", error);
            res.status(500).send('Something broke!');
        }
    });
})

router.get('/comps/:quickRefId', cors(), function(req, res, next){
  const quickRefId = req.params['quickRefId'];
  const sqftRangePct = req.query['sqftRangePct'];
  const salesComp = req.query['sales'];

  const percAboveBelow = sqftRangePct ? sqftRangePct : 10;
  const useSales = salesComp ? salesComp : false;
  console.log('Finding comps for quickRefId=',quickRefId,
              'at percAboveBelow=',percAboveBelow,
              'salesComp=', useSales);
  const percAbove = 1 + (percAboveBelow / 100);
  const percBelow = 1 - (percAboveBelow / 100);

  let result = {"subject" : "","comps":[]};

  let context = {"percAbove":percAbove,"percBelow":percBelow};
  wcadPropDao.getPropertyByQuickRefId(quickRefId)
    .then(wcadProp => {
      result.subject = wcadProp.summary;
      return wcadPropDao.getCompsFor(context, quickRefId)
        .then( compList => {
          let simpleList = [];
          for(x in compList){
            simpleList.push(compList[x].quickRefId);
          }
          console.log("simpleList:", simpleList);
          wcadPropDao.getHydratedProps(simpleList)
            .then( hydratedComps => {
              let compSummaries = [];
              for(x in hydratedComps){
                compSummaries.push(hydratedComps[x].summary);
              }
              result.comps = compSummaries;
              result = wcadFunc.calcDiffsForSales(result);
              result = wcadFunc.calcIndicatedValue(result);
              result = wcadFunc.sortComps(result, useSales);
              res.json(result);
            }).catch(error => {
              console.log("HydrateError:", error);
            })
        });
    }).catch(error => {
      if(error.message === "no property found"){
        console.log("INFO:", error.message);
        res.status(404).send(error.message);
      } else {
        console.log("ERROR:", error);
        res.status(500).send('Something broke!');
      }
    });
})

module.exports = router;
