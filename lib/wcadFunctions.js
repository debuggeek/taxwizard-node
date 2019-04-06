

function calcLivingAreaValAdj(subj, comp){
  let result = 11111111;

  result = subj.LivingAreaValues - comp.LivingAreaValues;

  return result;
}

function calcLocationFactor(subjSummary, compSummary){
  //All our searches are currently in the same hood so this will be 1 for all searches for now
  if(subjSummary.NeighborhoodCode === compSummary.NeighborhoodCode){
    return 1;
  } else {
    //There will be a flat % adjustment for each neighborhood (based on the multiplier needed to get the cost schedules to get closer to the sales prices).
    //TODO fix for non matching hoods
    return 99999999;
  }
}

function calcLocationAdj(subj, comp){
  //All our searches are currently in the same hood so this will be 0 for all searches for now
  if(subj.NeighborhoodCode === comp.NeighborhoodCode){
    return 0;
  } else {
    //(Market area media value * subj location factor) - (market area median val * comp location factor)
    //TODO fix for non matching hoods
    return 22222222;
  }
}

function calcDeprecationAdj(subj, comp){
  let result = 33333333;
  //2017 val
  let valPerYear = 500;

  if(subj.actualYear > comp.actualYear){
      result = (subj.actualYear - comp.actualYear) * valPerYear;
  } else {
      result = (comp.actualYear - subj.actualYear) * valPerYear;
  }

  return result;
}

function calcNonLivingAreaValueAdj(subj, comp){
  let result = 44444444;

  result = subj.NonLivingAreaValues - comp.NonLivingAreaValues;
  return result;
}

function calcLandValueAdj(subj, comp){
  let result = 55555555;

  result = subj.TotalLandMktValue - comp.TotalLandMktValue;

  return result;
}

function calcAdjustedSalePriceAdj(compSummary){
  if(compSummary.SalePrice
    // && (compSummary.timeAdj || compSummary.timeAdj === 0)
    && (compSummary.livingAreaValueAdj || compSummary.livingAreaValueAdj === 0)
    && (compSummary.locationAdj || compSummary.locationAdj === 0)
    && (compSummary.deprecationAdj || compSummary.deprecationAdj === 0)
    && (compSummary.nonLivingAreaValueAdj || compSummary.nonLivingAreaValueAdj === 0)
    && (compSummary.landValueAdj || compSummary.landValueAdj === 0)) {
      return compSummary.SalePrice  +
              // compSummary.timeAdj +
              compSummary.livingAreaValueAdj +
              compSummary.locationAdj +
              compSummary.deprecationAdj +
              compSummary.nonLivingAreaValueAdj +
              compSummary.landValueAdj;
    }
  return 77777777;
}

function calcAdjustedEquityPrice(comp){
  result = 88888888;

  let unitAdj = 0;
  //let unitAdj = comp.unitPriceAdj * comp.TotalSqFtLivingArea;
  result = comp.TotalAssessedValue - (comp.landValueAdj + comp.nonLivingAreaValueAdj + unitAdj);
  return result;
}

var calcDiff = function(subjectSummary){
  return x => {
    // console.log("compSummary:",x);
    // console.log("subjectSummary:", subjectSummary);
    x.locationFactor = calcLocationFactor(subjectSummary, x);
    x.livingAreaValueAdj = calcLivingAreaValAdj(subjectSummary, x);
    x.locationAdj = calcLocationAdj(subjectSummary, x);
    x.deprecationAdj = calcDeprecationAdj(subjectSummary, x);
    x.nonLivingAreaValueAdj = calcNonLivingAreaValueAdj(subjectSummary, x);
    x.landValueAdj = calcLandValueAdj(subjectSummary, x);
    x.adjustedSalePrice = calcAdjustedSalePriceAdj(x);
    x.adjustedEquityPrice = calcAdjustedEquityPrice(x);
    return x;
  };
}

exports.calcDiffsForSales = function(subjCompObj){
  const subj = subjCompObj.subject;
  const compList = subjCompObj.comps;

  compList.map(calcDiff(subj));

  // console.log(subjCompObj);
  return subjCompObj;
}

exports.calcIndicatedValue = function(subjCompObj){
  const subj = subjCompObj.subject;
  const compList = subjCompObj.comps;

  if(compList.length == 0){
    console.log("WARN >> calcIndicatedValue >> No comps");
    subj.indicatedValue = null;
    return subjCompObj;
  }

  const compSalesSum = compList.map(x => x.adjustedSalePrice).reduce((compA, compB) => compA + compB);
  const compSalesAvg = compSalesSum / compList.length;
  subj.indicatedValue = compSalesAvg; // 99999999;
  return subjCompObj;
}

exports.sortComps = function(subjCompObj, sortBySales){
  const compList = subjCompObj.comps;
  if(sortBySales){
      compList.sort(function (a, b){
      return a.adjustedSalePrice - b.adjustedSalePrice;
    });
  } else {
    //equity sort
    compList.sort(function (a, b){
      return a.adjustedEquityPrice - b.adjustedEquityPrice;
    })
  }

  return subjCompObj;
}
