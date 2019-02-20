/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */ 
/*global define */

"use strict";
const mysql = require('mysql');
const express = require("express");
const router = express.Router();

const db = require("../lib/db.js");
const cfg = require("../lib/config").Config;

var con = mysql.createConnection({
    host     : cfg.host,
    user     : cfg.user,
    password : cfg.password,
    database : cfg.database,
    debug    : true
});

router.get("/config", function (req, res) {
    let dbconfig = {
        host: cfg.host,
        database: cfg.database
    };
    console.log("config: " + JSON.stringify(dbconfig));
    res.json(dbconfig);
    res.end();
});

router.get("/verify", function (req, res) {
    console.log("Executing verification");
    // db.connection.query("SELECT COUNT(1) FROM `"+cfg.batchPropTable+"`")
    //     .on('result', function (row) {
    //         console.log("Connected");
    //         res.json("Connected to db");
    //         res.json(row['COUNT(1)']);
    //     })
    //     .on('error', function (err) {
    //         res.status(500);
    //         res.json(err);
    //         //callback({error: true, err: err});
    //     });
    con.connect(function (err) {
        if (err) {
            res.send("Failed");
            throw err;
        } else {
            console.log("Connected!");
            res.send("Success");
        }
    });
    //con.end();
});

module.exports = router;
