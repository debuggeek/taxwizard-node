

function calcLivingAreaValAdj(subj, comp){
  let result = 11111111;

  result = subj.LivingAreaValues - comp.LivingAreaValues;

  return result;
}

function calcLocationAdj(subj, comp){
  let result = 22222222;
  //(Market area media value * subj location factor) - (market area median val * comp location factor)
  return result;
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

function totalSalesAdj() {
  let result = 77777777;

  result = this.livingAreaValueAdj + this.locationAdj + this.deprecationAdj +
            this.nonLivingAreaValueAdj + this.landValueAdj + this.adjustedSalePrice;

  return result;
}

function calcAdjustedSalePriceAdj(comp){
  let result = 666;

  //result = subj.salesPrice - subj.totalSalesAdj;
  return result;
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
