let mysqlOld = require('mysql2');
let mysql = require('mysql2/promise');
var Sequelize = require('sequelize');
var cfg = require('./config').Config;

/**
* Setup DB connection
*/
let pool = mysql.createPool({
    connectionLimit : cfg.connectionLimit, //important
    host     : cfg.host,
    user     : cfg.user,
    password : cfg.password,
    database : cfg.database,
    debug    : cfg.debug
});

let oldPool = mysqlOld.createPool({
  connectionLimit : cfg.connectionLimit, //important
  host     : cfg.host,
  user     : cfg.user,
  password : cfg.password,
  database : cfg.database,
  debug    : cfg.debug
});

const Op = Sequelize.Op;
const operatorsAliases = {
  /*ignore jslint start*/
  $gte: Op.gte,
  $gt: Op.gt,
  $lte: Op.lte,
  $lt: Op.lt,
  $and: Op.and,
  /*ignore jslint end*/
}

exports.sequelize = new Sequelize(cfg.wcadDB, cfg.user, cfg.password, {
  host: cfg.host,
  dialect: cfg.dialect,
  logging: false,
  operatorsAliases: operatorsAliases,
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
});

exports.conn = {
  queryPromise: function(qArg, vals) {
    return new Promise((resolve, reject) => {
      oldPool.getConnection(function (error, connx) {
        connx.query(qArg, vals, function(error, results) {
            connx.release();
            if (error) return reject(error);
            //console.log("conn results=",results);
            resolve(results);
        });
      });
    });
  },
  queryAsync: async function(qArg, vals) {
    try {
      const [rows, fields] = await pool.query(qArg, vals);
      // console.log("rows", rows);
      // console.log("fields", fields);
      return(rows);
    } catch (error){
      throw (error);
    }
  }
};

exports.connection = {
    query: function () {
        let queryArgs = Array.prototype.slice.call(arguments),
            events = [],
            eventNameIndex = {};

        pool.getConnection(function (err, conn) {
            if (err) {
                if (eventNameIndex.error) {
                    eventNameIndex.error();
                }
            }
            if (conn) {
                let q = conn.query.apply(conn, queryArgs);
                q.on("end", function () {
                    conn.release();
                });

                events.forEach(function (args) {
                    q.on.apply(q, args);
                });
            }
        });

        return {
            on: function (eventName, callback) {
                events.push(Array.prototype.slice.call(arguments));
                eventNameIndex[eventName] = callback;
                return this;
            }
        };
    }
};
