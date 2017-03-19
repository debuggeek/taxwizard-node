var mysql = require('mysql');

/**
* Setup DB connection
*/
var pool      =    mysql.createPool({
    connectionLimit : 100, //important
    host     : 'fivestonetcad2.cusgdaffdgw5.us-west-2.rds.amazonaws.com',
    user     : 'dgDBMaster',
    password : '2x5Z3xF8t15F',
    database : 'tcad_2016',
    debug    :  false
});

// var pool = mysql.createPool(config.db);

exports.connection = {
    query: function () {
        var queryArgs = Array.prototype.slice.call(arguments),
            events = [],
            eventNameIndex = {};

        pool.getConnection(function (err, conn) {
            if (err) {
                if (eventNameIndex.error) {
                    eventNameIndex.error();
                }
            }
            if (conn) {
                var q = conn.query.apply(conn, queryArgs);
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
