const db = require('../lib/db.js');

exports.resetBatchProp = async function resetBatchProp(propId){
    let resetResult = {
        success:false,
        notFound:false,
        resetCount:null,
        message:''
    };
    let dbRes = null;
    let baseQuery = "UPDATE `BATCH_PROP` " +
                    "SET `completed` = 'false', " +
                    "`TotalComps` = NULL, " +
                    "`ErrorSeen` = NULL ";
    
    console.log("Reseting propId="+propId);

    if(propId === '*'){
        dbRes = await db.conn.queryPromise( baseQuery );
    } else {
        dbRes = await db.conn.queryPromise( baseQuery +
            "WHERE `prop` = ?",
            [propId]
        );
    }

    console.log("dbRes is " + JSON.stringify(dbRes));
    if(dbRes.affectedRows === 0){
        resetResult.notFound = true;
        resetResult.message = "propId not found: " + propId;
    } else if(dbRes.affectedRows === 1){
        if(dbRes.changedRows == 0){
            resetResult.message = "nothing had to change to reset " + propId;
        }
        resetResult.success = true;
    } else if(dbRes.affectedRows > 1) {
        if(dbRes.changedRows == 0){
            resetResult.message = "nothing had to change to reset " + dbRes.affectedRows + " possible matched rows";
        } else {
            resetResult.message = "Number of rows changed is " + dbRes.changedRows;
        }
        resetResult.success = true;
    }
    console.log("ResetResult is " + JSON.stringify(resetResult));
    return resetResult;
}

exports.resetAllBatchProp = async function resetAllBatchProp(){
    return await this.resetBatchProp('*');
}

exports.purgeAllBatch = async function purgeAllBatch(){
    let query = "TRUNCATE `BATCH_PROP`";
    let resetResult = false;
    dbRes = await db.conn.queryPromise( query );

    console.log("dbRes is " + JSON.stringify(dbRes));
    if(dbRes.serverStatus === 2){
        resetResult = true;
    }
    console.log("ResetResult is " + JSON.stringify(resetResult));
    return resetResult;
}

/*
* Returns the processed batch properties data using pre-2019 interests
*/
exports.getBatchProps_2018 = async function getBatchProps_2018(limit, start){
    dbRes = await db.conn.queryPromise("SELECT prop,prop_mktval,"+
        "Median_Sale5,Low_Sale5,High_Sale5," +
        "Low_Sale10,Median_Sale10,High_Sale10," +
        "Median_Sale15,Low_Sale15,High_Sale15," +
        "Median_Eq11,TotalComps FROM `BATCH_PROP` WHERE completed = 'true' LIMIT ? OFFSET ?",
        [limit, start]);

    console.log("getBatchProps_2018 query found " + dbRes.length + " hits");
    //console.log("getBatchProps_2018 is " + JSON.stringify(dbRes));
    return dbRes;
}

exports.getBatchProps_2019 = async function getBatchProps_2019(limit, start){
    dbRes = await db.conn.queryPromise("SELECT prop,prop_mktval,"+
        "Comp1_IndicatedValue,Comp2_IndicatedValue,Comp3_IndicatedValue," +
        "Comp4_IndicatedValue,Comp5_IndicatedValue,Comp6_IndicatedValue," +
        "Comp7_IndicatedValue,Comp8_IndicatedValue,Comp9_IndicatedValue," +
        "Comp10_IndicatedValue,TotalComps FROM `BATCH_PROP` WHERE completed = 'true' LIMIT ? OFFSET ?",
        [limit, start]);

    console.log("getBatchProps_2019 query found " + dbRes.length + " hits");
    //console.log("getBatchProps_2019 is " + JSON.stringify(dbRes));
    return dbRes;
}