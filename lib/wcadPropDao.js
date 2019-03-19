var Property = require('../models/property');
var Improvement = require('../models/improvement');
var Land = require('../models/wcad/tsgland.js');

function copyProps(source, target) {
  for (let k in source) {
    target[k] = source[k];
  }
}

function deriveValues(property) {
  //Initialize computed values
  property.summary = { "LivingAreaValues": 0, "NonLivingAreaValues": 0, "IndicatedValue": 0 };
  //copy all important prop fields
  copyProps(property.property.dataValues, property.summary);

  let lav = 0;
  let nlav = 0;

  //Handle Improvements
  property.improvements.forEach(improvement => {
    let tempVal = improvement.vTSGRSeg_SegmentValue / improvement.vTSGRSeg_AdjFactor;
    if (improvement.fSegType === "MA") {
      lav += tempVal;
    } else {
      nlav += tempVal;
    }

    if (improvement.firstPage === 1) {
      property.summary.actualYear = improvement.fActYear;
      property.summary.effectiveYear = improvement.fEffYear;
      property.summary.class = improvement.fSegClass;
    }
  });

  //Handle Land Fields
  if (property && property.land && property.land.dataValues) {
    copyProps(property.land.dataValues, property.summary);
  } else {
    console.log("WARN >> deriveValues >> no land datavalues for property=", property.property.PropertyId);
  }

  property.summary.LivingAreaValues = Math.round(lav);
  property.summary.NonLivingAreaValues = Math.round(nlav);
  return property;
}

exports.getPropertyByQuickRefId = async function (quickRefId) {
  let result = {};
  let property = await Property.findOne({
    where: {
      quickRefId: quickRefId
    }
  });
  if (property === null) {
    throw new Error("QuickRefId not found:", quickRefId);
  }
  // console.log(`quickRefId=${property.get('quickRefId')} property=${property.get('PropertyId')}`);
  result["property"] = property;
  const propId = property.get('PropertyId');

  await Promise.all([
    Improvement.findAll({ where: { PropertyId: propId } })
      .then(improvements => { result["improvements"] = improvements; }),
    Land.findOne({ where: { PropertyId: propId } })
      .then(land => { result["land"] = land })
  ]);
  deriveValues(result);
  return result;
}

exports.getComps = async function (context, quickRefId) {
  return new Promise((resolve, reject) => {
    this.getPropertyByQuickRefId(quickRefId).then(property => {
      const subj = property.property;
      console.log("Found subj=", subj.get('quickRefId'));
      resolve(getCompsFor(context, subj));
    }).catch(error => {
      reject(console.log("ERROR:", error));
    });
  });
}

/*
* subj: Subject Summary
*/
exports.getCompsFor = async function (context, subj) {
  const subjHood = subj.NeighborhoodCode;
  const subjLivingArea = subj.TotalSqFtLivingArea;
  const areaMin = subjLivingArea * context.percBelow;
  const areaMax = subjLivingArea * context.percAbove;
  try {
    let possibleComps = await Property.findAll({
      where: {
        NeighborhoodCode: subjHood,
        TotalSqFtLivingArea: {
          $and: {
            $lt: areaMax,
            $gt: areaMin
          }
        }
      },
      attributes: ['quickRefId']
    });
    console.log("PossibleComps = ", possibleComps.length);
    return possibleComps;
  } catch (err) {
    console.log("ERROR on Property.findAll: " + err);
  };
}

exports.getHydratedProps = function (propArray) {
  return Promise.all(propArray.map(this.getPropertyByQuickRefId));
}
