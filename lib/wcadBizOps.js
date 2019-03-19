var wcadPropDao = require("../lib/wcadPropDao");
var wcadFunc = require("../lib/wcadFunctions");

async function findComps(queryParams){
    let result = { "subject": "", "comps": [] };
    let context = { "percAbove": queryParams.percAbove, "percBelow": queryParams.percBelow };
    const useSales = queryParams.useSales;

    try {
        const wcadProp = await wcadPropDao.getPropertyByQuickRefId(queryParams.quickRefId);
        result.subject = wcadProp.summary;
        const compList = await wcadPropDao.getCompsFor(context, result.subject);
        let simpleList = [];
        for (x in compList) {
            simpleList.push(compList[x].quickRefId);
        }
        // console.log("simpleList:", simpleList);
        const hydratedComps = await wcadPropDao.getHydratedProps(simpleList)
        let compSummaries = [];
        for (x in hydratedComps) {
            compSummaries.push(hydratedComps[x].summary);
        }
        result.comps = compSummaries;
        result = wcadFunc.calcDiffsForSales(result);
        result = wcadFunc.calcIndicatedValue(result);
        result = wcadFunc.sortComps(result, useSales);
    } catch (e) {
        console.log("ERROR >> findComps >> ", e);
        return e;
    }
    return result;
}

module.exports = {findComps};