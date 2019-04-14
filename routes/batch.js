const express = require("express");
const router = express.Router();
const cors = require("cors");

const db = require("../lib/db.js");
const JSZip = require("jszip");

const batchOps = require("../lib/batchOps");
const batchSettings = require("../lib/batchSettings");

const cfg = require("../lib/config").Config;

/*
Not really used except for testing
*/
router.get("/", cors(), function(req, res) {
    res.type("json");
    res.send({
        "rows" : [
            {
                "propId":1,
                "marketValue":100000,
                "medianSale5":50000,
                "medianSale10":75000,
                "medianSale15":100000,
                "medianEq11":200000,
                "totalComps":20,
                "pdf":"tbd"
            }
        ]
    });
});

router.get("/total", function(req, res) {
    db.connection.query("SELECT COUNT(1) FROM `"+cfg.batchPropTable+"`")
        .on("result", function (row) {
            res.json(row["COUNT(1)"]);
        })
        .on("error", function (err) {
            callback({error: true, err: err});
        });
});

router.get("/unprocessed", function(req, res) {
    db.connection.query("SELECT COUNT(1) FROM `"+cfg.batchPropTable+"` WHERE completed = false")
        .on("result", function (row) {
            res.json(row["COUNT(1)"]);
        })
        .on("error", function (err) {
            callback({error: true, err: err});
        });
});

router.get("/processed", function(req, res) {
    db.connection.query("SELECT COUNT(1) FROM `"+cfg.batchPropTable+"` WHERE completed = true")
        .on("result", function (row) {
            res.json(row["COUNT(1)"]);
        })
        .on("error", function (err) {
            callback({error: true, err: err});
        });
});

router.get("/settings", function(req, res) {
    try {
        let qResults = await batchSettings.getCurrBatchSettings();
        console.log(qResults);
        res.json(qResults);
    } catch(error) {
        console.log(error);
        res.status(500).send(error);
    }
});

router.post("/settings", function(req,res) {
    let tracing = true;
    let postData = req.body;
    try {
        if(tracing) { console.log("postData=", postData); }

        let result = await batchSettings.updateCurrBatchSettings(postData);
        console.log("result", result);
        res.json(qResults);
    } catch(error) {
        console.log(error);
        res.status(500).send(error);
    }
});

router.get("/summary", function(req, res) {
    let result = {"processed" : null, "unprocessed" : null, "total" : null};
    let completedPromise = db.conn.queryPromise("SELECT COUNT(1) FROM `"+cfg.batchPropTable+"` WHERE completed = 'true'");
    let uncompletedPromise = db.conn.queryPromise("SELECT COUNT(1) FROM `"+cfg.batchPropTable+"` WHERE completed = 'false'");
    let totalPromise = db.conn.queryPromise("SELECT COUNT(1) FROM `"+cfg.batchPropTable+"`");
    completedPromise.then(qResults => {
        let count;
        count = qResults[0]["COUNT(1)"];
        result.processed = count;
        console.log(result);
        uncompletedPromise.then(qResults => {
            count = qResults[0]["COUNT(1)"];
            result.unprocessed=count;
            console.log(result);
            totalPromise.then(qResults => {
                count = qResults[0]["COUNT(1)"];
                result.total=count;
                console.log(result);
                res.json(result);
            }).catch(error => {
                console.log(error);
            });
        }).catch(error => {
            console.log(error);
        });
    }).catch(error => {
        console.log(error);
    });

});

/**
 * Returns all the summary batch propertys calculated
 */
router.get("/all/:format*?", async function(req, res, next) {
    const limit=10000;
    const page=(typeof req.params.page!=="undefined")?parseInt(req.params.page):1;
    const start=(page-1)*limit;

    try {
        let result = null;
        if(req.query.version === "old"){
            result = await batchOps.getBatchProps_2018(limit, start);
        } else {
            result = await batchOps.getBatchProps_2019(limit, start);
        }
        console.log(result.length + " entries in "+cfg.batchPropTable+"");
        if(req.params.format === "csv") {
            req.retrievedData = result;
            next("route")
        } else {
            res.json(result);
        }
    } catch(error) {
        console.log(error);
        res.status(500);
    } finally {
        res.send();
    }
});

router.get("/all/:format", function(req, res) {
    /**
     * @param req                   The request
     * @param req.retrievedData     Data stored in previous processing
     */
    if(req.params.format === "csv"){
        const items = req.retrievedData;
        const replacer = (key, value) => value === null ? "" : value; // specify how you want to handle null values here
        const header = Object.keys(items[0]);
        let csv = items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(","));
        csv.unshift(header.join(","));
        csv = csv.join("\r\n");
        res.writeHead(200, {
            "Content-Type": "text/plain",
            "Content-Disposition": "attachment; filename=props.csv",
            "Content-Length": csv.length
        });
        res.end(csv);
    }
});

/**
 * Used to reset a single/all pdf by propId
 */
router.post("/reset", async function(req, res) {
    const propId = (typeof req.query.prop!=="undefined")?parseInt(req.query.prop):null;
    const all = (typeof req.query.all!=="undefined")?req.query.all:null;

    if(all === null && propId === null){
        res.status(400).send("Must provide propId");
    }
    let result = null;

    if(all){
        console.log("Resetting all properties");
        result = await batchOps.resetAllBatchProp();
    } else {
        // We have a single prop Id
        console.log("Resetting state for " + propId);
        result = await batchOps.resetBatchProp(propId);
    }
    console.log("Result was " + JSON.stringify(result));

    if(result.success === true){
        res.status(200);
        res.json(result);
    } else if(result.notFound === true){
        res.status(404);
        res.json(result);
    } else {
        res.status(500);
    }
    res.end();
});

/**
 * Used to purge all pdf by propId
 */
router.post("/purge", async function(req, res) {

    console.log("Purging all properties");
    result = await batchOps.purgeAllBatch();
    console.log("Result was " + JSON.stringify(result));

    if(result === true){
        res.status(200);
        res.json("OK");
    } else {
        res.status(500);
    }
    res.end();
});

/**
 * Used to retrieve a single pdf by propId
 */
router.get("/pdf", function(req, res) {
    const propId = (typeof req.query.subj!=="undefined")?parseInt(req.query.subj):null;

    if(propId === null){
        res.status(400).send("Must provide propId");
    }

    console.log("Getting PDF for " + propId);

    let qPromise = db.conn.queryPromise("SELECT pdfs FROM "+cfg.batchPropTable+" WHERE prop=?", [propId]);
    qPromise.then(qResults => {
        console.log(qResults.length + " results found");
        if(qResults.length === 0){
            res.status(404);
            res.end();
        } else {
            //2 step conversion from SQL chars to the base64 encoding that it is
            let data = Buffer.from(qResults[0]["pdfs"]).toString();
            let d2 = Buffer.from(data,"base64");
            res.writeHead(200, {
                "Content-Type": "application/pdf;base64",
                "Content-Disposition": "attachment; filename="+propId+".pdf",
                "Content-Length": d2.length
            });
            res.end(d2);
        }
    }).catch(error => {
        console.log(error);
        res.status(500).send(error);
    });

});

/**
 * Used to retrieve all pdfs and zip up
 */
router.get("/pdfs", function(req, res) {
    console.log("Getting PDF for all properties");

    let qPromise = db.conn.queryPromise("SELECT prop, pdfs FROM "+cfg.batchPropTable+"");
    qPromise.then(qResults => {
        console.log(qResults.length + " results found");
        if(qResults.length === 0){
            res.status(404);
            res.send();
        }

        let zip = new JSZip();
        qResults.forEach(row => {
            console.log("processing " + row["prop"]);
            let propId = row["prop"];
            if(row["pdfs"] != null) {
                let data = Buffer.from(row["pdfs"]).toString();
                let d2 = Buffer.from(data, "base64");
                zip.file(propId + ".pdf", d2, {base64: true});
            } else {
                console.log("No pdf found for" + propId);
            }
        });
        zip.generateAsync({type:"base64"})
            .then(function(content) {
                let d2 = Buffer.from(content,"base64");
                res.writeHead(200, {
                    "Content-Type": "application/zip;base64",
                    "Content-Disposition": "attachment; filename=props.zip",
                    "Content-Length": d2.length
                });
                res.end(d2);
            }, function (e) {
                showError(e);
            });
    }).catch( error => {
        console.log(error);
        res.status(500).send(error);
    });
});

module.exports = router;
