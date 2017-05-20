var Property = require('../models/property');
var Improvement = require('../models/improvement');
var Land = require('../models/wcad/tsgland.js');

function deriveValues(property){
  property.derivedVals = {"LivingAreaValues":0,"NonLivingAreaValues":0};

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
      property.derivedVals.actualYear = improvement.fActYear;
      property.derivedVals.effectiveYear = improvement.fEffYear;
      property.derivedVals.class = improvement.fSegClass;
    }
  });

  property.derivedVals.LivingAreaValues = Math.round(lav);
  property.derivedVals.NonLivingAreaValues = Math.round(nlav);
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

// exports.getPropertyByQuickRefIdPromise = function(quickRefId){
//   return Promise(resolve, reject => {
//     getPropertyByQuickRefId(quickRefId)
// })
