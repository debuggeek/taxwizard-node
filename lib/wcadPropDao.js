var Property = require('../models/property');
var Improvement = require('../models/improvement');
var Land = require('../models/wcad/tsgland.js');
const SalesHistory = require("../models/wcad/salesHistory");

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

function createSummary(property) {
  let summary;
  //Initialize computed value
  if (property.land && property.land) {
    summary = { "LivingAreaValues": 0, "NonLivingAreaValues": 0, "IndicatedValue": 0,
                  ...property.dataValues, 
                  ...property.land.dataValues,
                  "improvements": null,
                  "land": null
                  };
  } else {
    console.log("WARN >> deriveValues >> no land datavalues for property=", property.property.PropertyId);
    summary = { "LivingAreaValues": 0, "NonLivingAreaValues": 0, "IndicatedValue": 0,
                  ...property.dataValues, 
                  "improvements": null
              };
  }

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
      summary.actualYear = improvement.fActYear;
      summary.effectiveYear = improvement.fEffYear;
      summary.class = improvement.fSegClass;
    }
  });

  summary.LivingAreaValues = Math.round(lav);
  summary.NonLivingAreaValues = Math.round(nlav);
  return summary;
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

exports.getHydratedPropertyByQuickRefId = async function (quickRefId) {
  let property = await Property.findOne({
    where: {
      quickRefId: quickRefId
    },
    include: [
      {
        model: Improvement,
        as: "improvements",
        require: true,
      },
      {
        model: Land,
        as: "land",
        require: true,
      }
    ],
  });
  if (property === null) {
    throw new Error("PropertyId not found:", propertyId);
  }
  // console.log("------Hydrated Property-----\n" + JSON.stringify(property));
  let summary = createSummary(property);
  // console.log("------Summarized Property-----\n" + JSON.stringify(summary));
  let result = { "property": property, "summary": summary }
  //console.log("------Result -----\n" + JSON.stringify(result));
  return result;
}

exports.getHydratedPropertyByPropertyId = async function (propertyId) {
  let property = await Property.findOne({
    where: {
      PropertyId: propertyId
    },
    include: [
      {
        model: Improvement,
        as: "improvements",
        require: true,
      },
      {
        model: Land,
        as: "land",
        require: true,
      }
    ],
  });
  if (property === null) {
    throw new Error("PropertyId not found:", propertyId);
  }
  // console.log("------Hydrated Property-----\n" + JSON.stringify(property));
  let summary = createSummary(property);
  // console.log("------Summarized Property-----\n" + JSON.stringify(summary));
  let result = { "property": property, "summary": summary }
  //console.log("------Result -----\n" + JSON.stringify(result));
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

exports.getSalesCompsFor = async function (context, subj) {
  const subjHood = subj.NeighborhoodCode;
  const oldestDate = context.oldestDate ? context.oldestDate : "2000-01-01";

  try {
    let possibleComps = await SalesHistory.findAll({
      where: {
        NeighborhoodCode: subjHood,
        SaleDate: {
            $gt: oldestDate
        }        
      },
      attributes: ["PropertyID", "SaleDate", "TotalLandValue", "TotalBuildingValue", "SalePrice"]
    });
    console.log("PossibleComps = ", possibleComps.length);
    return possibleComps;
  } catch (err) {
    console.log("ERROR on Property.findAll: " + err);
  };
}

exports.getHydratedSalesComps = async function (context, subj) {
  const subjHood = subj.NeighborhoodCode;
  const oldestDate = context.oldestDate ? context.oldestDate : "2000-01-01";
  const subjLivingArea = subj.TotalSqFtLivingArea;

  let sqftWhere = {};
  if(context.percAbove && context.percBelow) {
    const areaMin = subjLivingArea * context.percBelow;
    const areaMax = subjLivingArea * context.percAbove;
    sqftWhere = {
      TotalSqFtLivingArea: {
        $and: {
          $lt: areaMax,
          $gt: areaMin
        }
      }
    };
  }

  let possibleComps;
  try {
    possibleComps = await SalesHistory.findAll({
      where: {
        NeighborhoodCode: subjHood,
        SaleDate: {
            $gt: oldestDate
        }
      },
      include: [{
        model: Property,
        where: sqftWhere,
        attributes: ["QuickRefId", "TotalSqFtLivingArea"],
        include: [
          {
            model: Improvement,
            as: "improvements",
            require: true,
          },
          {
            model: Land,
            as: "land",
            require: true,
          }
        ],
       }],
      attributes: ["PropertyID", "SaleDate", "TotalLandValue", "TotalBuildingValue", "SalePrice"]
    });
  } catch (err) {
    console.log("ERROR on SalesHistory.findAll: " + err);
  };
  try{
    console.log("PossibleComps = ", possibleComps.length);
    let results = [];
    for (var i in possibleComps){
      let summary = createSummary(possibleComps[i].Property);
      let salesSummary = {...summary,
                          "SaleDate": possibleComps[i].SaleDate,
                          "SalePrice": possibleComps[i].SalePrice
                         };
      let salesCompWSummary = { "salesComp": possibleComps[i], "summary": salesSummary }
      results.push(salesCompWSummary);
    }
    return results;
  } catch (err) {
    console.log("ERROR on Creating SalesComp Summaries: " + err);
  };
}

exports.getHydratedPropsForPropertyId = function (propArray) {
  return Promise.all(propArray.map(this.getPropertyByPropertyId));
}

exports.getHydratedProps = function (propArray) {
  return Promise.all(propArray.map(this.getPropertyByQuickRefId));
}
