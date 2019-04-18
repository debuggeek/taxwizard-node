"use strict";
const db = require("../lib/db.js");
const cfg = require("./config").Config;

async function getCurrBatchSettings() {
    const dbString = `FROM ${cfg.batchSettingsTable} WHERE id=(SELECT max(id) FROM ${cfg.batchSettingsTable})`;
    try{
        let qResults = await db.conn.queryAsync("SELECT TrimIndicated,"+
        "MultiHood,"+
        "IncludeVU,"+
        "IncludeMLS,"+
        "NumPrevYears,"+
        "SqftRangePctEnabled, SqftRangePct,SqftRangeMin,SqftRangeMax,"+
        "ClassRange,ClassRangeEnabled,"+
        "SaleRatioEnabled,SaleRatioMin,SaleRatioMax,"+
        "PercentGood,PercentGoodEnabled,PercentGoodMin,PercentGoodMax,"+
        "NetAdj,NetAdjEnabled,"+
        "ImpLimit,"+
        "LimitTcadScores,LimitTcadScoresAmount,TcadScoreLimitMin,TcadScoreLimitMax,"+
        "LimitToCurrentYearLowered,"+
        "GrossAdjFilterEnabled,"+
        "ShowTcadScores,ShowSaleRatios,"+
        "rankByIndicated, " +
        "SaleTypeQ, " +
        "MaxDisplay " +
        dbString);

        if(qResults.length != 1){
            throw new Error("Expected exactly 1 batch settings to be returned. Got " + qResults.length);
        }
        const results = qResults[0];
        return(results);
    } catch(error) {
        // console.log(error);
        throw (error);
    }
}

function getColName(string){
    let colMap = {"onlyLowerComps":"TrimIndicated","multiHood":"MultiHood","includeVU":"IncludeVU", "mlsMultiYear":"NumPrevYears",
        "useSqftRangePct":"SqftRangePctEnabled","sqftRangePct":"SqftRangePct","sqftRangeMin":"SqftRangeMin","sqftRangeMax":"SqftRangeMax",
        "subClassRange":"ClassRange", "subClassRangeEnabled":"ClassRangeEnabled",
        "ratiosEnabled":"SaleRatioEnabled","saleRatioMin":"SaleRatioMin","saleRatioMax":"SaleRatioMax",
        "pctGoodRange":"PercentGood","pctGoodRangeEnabled":"PercentGoodEnabled","pctGoodMin":"PercentGoodMin","pctGoodMax":"PercentGoodMax",
        "netAdjustAmt":"NetAdj","netAdjEnabled":"NetAdjEnabled",
        "limitImps":"ImpLimit",
        "tcadScoreLimitEnabled":"LimitTcadScores","tcadScoreLimitPct":"LimitTcadScoresAmount","tcadScoreLimitMin":"TcadScoreLimitMin","tcadScoreLimitMax":"TcadScoreLimitMax",
        "onlyCurrYearLowered":"LimitToCurrentYearLowered", "grossAdjEnabled":"GrossAdjFilterEnabled",
        "showTcadScores":"ShowTcadScores",
        "rankByIndicated":"rankByIndicated",
        "saleTypeQ":"SaleTypeQ",
        "maxDisplay":"MaxDisplay"};

    const allColumns = {"TrimIndicated":"TrimIndicated","MultiHood":"MultiHood,","IncludeVU":"IncludeVU", "NumPrevYears":"NumPrevYears",
    "SqftRangePctEnabled":"SqftRangePctEnabled","SqftRangePct":"SqftRangePct","SqftRangeMin":"SqftRangeMin","SqftRangeMax":"SqftRangeMax",
    "ClassRange":"ClassRange", "ClassRangeEnabled":"ClassRangeEnabled",
    "SaleRatioEnabled":"SaleRatioEnabled","SaleRatioMin":"SaleRatioMin","SaleRatioMax":"SaleRatioMax",
    "PercentGood":"PercentGood","PercentGoodEnabled":"PercentGoodEnabled","PercentGoodMin":"PercentGoodMin","PercentGoodMax":"PercentGoodMax",
    "NetAdj":"NetAdj","NetAdjEnabled":"NetAdjEnabled",
    "ImpLimit":"ImpLimit",
    "LimitTcadScores":"LimitTcadScores","LimitTcadScoresAmount":"LimitTcadScoresAmount","TcadScoreLimitMin":"TcadScoreLimitMin","TcadScoreLimitMax":"TcadScoreLimitMax",
    "LimitToCurrentYearLowered":"LimitToCurrentYearLowered", "GrossAdjFilterEnabled":"GrossAdjFilterEnabled",
    "ShowTcadScores":"ShowTcadScores",
    "rankByIndicated":"rankByIndicated",
    "SaleTypeQ":"SaleTypeQ",
    "MaxDisplay":"MaxDisplay"};

    if(colMap.hasOwnProperty(string)){
        return colMap[string];
    }

    if(allColumns.hasOwnProperty(string)){
        return allColumns[string];
    }

    console.log("No column found to match ", string);
    return "";
}

function copyFields(target, source) {
    let tracing = false;
    for (let field in source) {
        // noinspection JSUnfilteredForInLoop
        if(tracing) { console.log("Looking for " + field); }
        let colName = getColName(field);
        if(tracing) { console.log(field + " mapped to colName=" + colName); }
        if (target.hasOwnProperty(colName)) {
            if(tracing) { console.log("Found field " + colName); }
            // noinspection JSUnfilteredForInLoop
            target[colName] = source[field];
        }
    }
    if(tracing) { console.log("copyFields target", target); }
    return target;
}

async function updateCurrBatchSettings(newSettings){
    let currJson = await getCurrBatchSettings();
    let tracing = false;

    if (tracing) { console.log("newSettings=", newSettings); }

    //We need to get all the fields of interest
    let update = copyFields(currJson, newSettings);
    if (tracing) { console.log("updatePostCopy=", update); }

    //TODO why do I need this below?
    // Turning off for now
    // update.TrimIndicated = 0;
    try {
        const result = await db.conn.queryAsync(`INSERT INTO ${cfg.batchSettingsTable} ` +
            "SET TrimIndicated = ?, MultiHood = ?, IncludeVU = ?, IncludeMLS = ?, NumPrevYears = ?, " +
            "SqftRangePctEnabled = ?, SqftRangePct = ?, SqftRangeMin = ?, SqftRangeMax = ?," +
            "ClassRange = ?, ClassRangeEnabled = ?," +
            "SaleRatioEnabled = ?, SaleRatioMin = ?, SaleRatioMax = ?, " +
            "PercentGood = ?, PercentGoodEnabled = ?, PercentGoodMin = ?, PercentGoodMax = ?, " +
            "NetAdj = ?, NetAdjEnabled = ?, ImpLimit = ?, "+
            "LimitTcadScores = ?, LimitTcadScoresAmount = ?, TcadScoreLimitMin = ?, TcadScoreLimitMax = ?, "+
            "LimitToCurrentYearLowered = ?, GrossAdjFilterEnabled = ?, " +
            "ShowTcadScores = ?, ShowSaleRatios = ?, rankByIndicated = ?, SaleTypeQ = ?, "+
            "MaxDisplay = ? ",
            [
                update["TrimIndicated"], update["MultiHood"], update["IncludeVU"], update["IncludeMLS"], update["NumPrevYears"],
                update["SqftRangePctEnabled"], update["SqftRangePct"], update["SqftRangeMin"], update["SqftRangeMax"],
                update["ClassRange"], update["ClassRangeEnabled"],
                update["SaleRatioEnabled"], update["SaleRatioMin"], update["SaleRatioMax"],
                update["PercentGood"], update["PercentGoodEnabled"], update["PercentGoodMin"], update["PercentGoodMax"],
                update["NetAdj"], update["NetAdjEnabled"], update["ImpLimit"],
                update["LimitTcadScores"],  update["LimitTcadScoresAmount"], update["TcadScoreLimitMin"], update["TcadScoreLimitMax"],
                update["LimitToCurrentYearLowered"], update["GrossAdjFilterEnabled"],
                update["ShowTcadScores"], update["ShowSaleRatios"], update["rankByIndicated"], update["SaleTypeQ"],
                update["MaxDisplay"]
            ]
        );

        console.log("result", result);
        return result;
    } catch(error) {
        console.log("ERROR >> updateCurrBatchSettings >> " + error);
    };
}

module.exports = {getCurrBatchSettings, updateCurrBatchSettings}