var mysql = require('mysql');
var Sequelize = require('sequelize');
var cfg = require('./config').Config;

/**
* Setup DB connection
*/
var pool      =    mysql.createPool({
    connectionLimit : 100, //important
    host     : cfg.host,
    user     : cfg.user,
    password : cfg.password,
    database : cfg.database,
    debug    :  cfg.debug
});

exports.sequelize = new Sequelize(cfg.wcadDB, cfg.user, cfg.password, {
  host: cfg.host,
  dialect: 'mysql',
  logging: true,
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
