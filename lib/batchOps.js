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