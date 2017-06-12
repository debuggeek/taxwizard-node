var Property = require('../models/property');
var Improvement = require('../models/improvement');
var Land = require('../models/wcad/tsgland.js');

function copyProps(source, target){
  for(var k in source) {
    target[k]=source[k];
  }
}

function deriveValues(property){
  property.summary = {"LivingAreaValues":0,"NonLivingAreaValues":0};
  copyProps(property.property.dataValues, property.summary);

  let lav = 0;
  let nlav = 0;
  property.improvements.forEach( improvement => {
    let tempVal = improvement.vTSGRSeg_SegmentValue / improvement.vTSGRSeg_AdjFactor;
    if(improvement.fSegType === "MA"){
       lav += tempVal;
    } else {
      nlav += tempVal;
    }

    if(improvement.firstPage === 1){
      property.summary.actualYear = improvement.fActYear;
      property.summary.effectiveYear = improvement.fEffYear;
      property.summary.class = improvement.fSegClass;
    }
  });

  property.summary.LivingAreaValues = Math.round(lav);
  property.summary.NonLivingAreaValues = Math.round(nlav);
  return property;
}

exports.getPropertyByQuickRefId = function(quickRefId) {
  return new Promise((resolve, reject) => {
    var result = {};
    let success = false;
    return Property.findOne({
        where : {
          quickRefId : quickRefId
        }
      }).then(property => {
        if (property === null) {
          reject(new Error("no property found"));
        }
        // console.log(`quickRefId=${property.get('quickRefId')} property=${property.get('PropertyId')}`);
        result["property"] = property;
        const propId = property.get('PropertyId');
        return Promise.all([
            Improvement.findAll({ where : {PropertyId : propId}})
                        .then(improvements =>{result["improvements"]=improvements;}),
            Land.findOne({ where : {PropertyId : propId}})
                .then(land => { result["land"]=land})
            ]).then( function() {
              resolve(deriveValues(result));
            }).catch(error => {
              reject(error);
            })
      }).catch(error => {
          reject(error);
      });
  });
}

exports.getCompsFor = function(context, quickRefId){
  return new Promise((resolve, reject) => {
    // let result = {"subject" : ""};
    this.getPropertyByQuickRefId(quickRefId)
      .then(property => {
        const subj = property.property;
        console.log("Found subj=", subj.get('quickRefId'));
        // result.subject = subj;

        const subjHood = subj.get('NeighborhoodCode');
        const subjLivingArea = subj.get('TotalSqFtLivingArea');
        Property.findAll({
          where : {
            NeighborhoodCode : subjHood,
            TotalSqFtLivingArea : {
              $and: {
                $lt : subjLivingArea * context.percAbove,
                $gt : subjLivingArea * context.percBelow
              }
            }
          },
          attributes: ['quickRefId']
        }).then(possibleComps => {
          console.log("PossibleComps = ", possibleComps.length);
          // result.comps = possibleComps;
          resolve(possibleComps);
        })
    }).catch(error => {
        reject(console.log("ERROR:", error));
        // res.status(500).send('Something broke!');
    });
  });
}

exports.getHydratedProps = function(propArray){
  return Promise.all(propArray.map(this.getPropertyByQuickRefId));
}
