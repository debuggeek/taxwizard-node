var production = {
    connectionLimit : 100, //important
    host     : "fivestonetcad2.cusgdaffdgw5.us-west-2.rds.amazonaws.com",
    user     : "dgDBMaster",
    password : "2x5Z3xF8t15F",
    database : "tcad_2018_7",
    wcadDB   : "wcad_2017",
    debug    :  false,
    key      : "/etc/letsencrypt/live/taxwizard.debuggeek.com/privkey.pem",
    cert     : "/etc/letsencrypt/live/taxwizard.debuggeek.com/fullchain.pem",
    batchPropTable : "BATCH_PROP",
    dialect: 'mysql',
    storage  : "",
    env : global.process.env.NODE_ENV || "prod"
};

var stage = {
    connectionLimit: 100, //important
    host: "fivestonetcad2.cusgdaffdgw5.us-west-2.rds.amazonaws.com",
    user: "dgDBMaster",
    password: "2x5Z3xF8t15F",
    database: "tcad_2018_7",
    wcadDB: "wcad_2017",
    debug: false,
    key: "/etc/letsencrypt/live/taxwizard2.debuggeek.com/privkey.pem",
    cert: "/etc/letsencrypt/live/taxwizard2.debuggeek.com/fullchain.pem",
    batchPropTable: "BATCH_PROP_STAGE",
    dialect: 'mysql',
    storage  : "",
    env: global.process.env.NODE_ENV || "prod"
};

var development = {
    connectionLimit : 100, //important
    host     : "localhost",
    user     : "root",
    password : "root",
    database : "tcad_2018",
    wcadDB   : "wcad_2017",
    debug    :  false,
    dialect  : 'mysql',
    storage  : "",
    batchPropTable : "BATCH_PROP_STAGE",
    env : global.process.env.NODE_ENV || "dev"
};

var local = {
    connectionLimit : 10, //important
    host: "",
    dialect: 'sqlite',
    storage: "../sqlite/local.db",
    env : global.process.env.NODE_ENV  || "local"
};

exports.Config = global.process.env.NODE_ENV === "prod" ? production : global.process.env.NODE_ENV === "stage" ? stage : local;
