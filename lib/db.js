var mysql = require('mysql');
var Sequelize = require('sequelize');
var cfg = require('./config').Config;

/**
* Setup DB connection
*/
var pool = mysql.createPool({
    connectionLimit : cfg.connectionLimit, //important
    host     : cfg.host,
    user     : cfg.user,
    password : cfg.password,
    database : cfg.database,
    debug    : cfg.debug
});

const Op = Sequelize.Op;
const operatorsAliases = {
  $gte: Op.gte,
  $gt: Op.gt,
  $lte: Op.lte,
  $lt: Op.lt,
  $and: Op.and,
}

exports.sequelize = new Sequelize(cfg.wcadDB, cfg.user, cfg.password, {
  host: cfg.host,
  dialect: cfg.dialect,
  logging: cfg.debug ? console.log : false,
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
      pool.getConnection(function (error, connx) {
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
    return await pool.getConnection(function (error, connx) {
        return connx.query(qArg, vals);
      });
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
                q.on('end', function () {
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
