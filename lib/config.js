var production = {
  connectionLimit : 100, //important
  host     : 'fivestonetcad2.cusgdaffdgw5.us-west-2.rds.amazonaws.com',
  user     : 'dgDBMaster',
  password : '2x5Z3xF8t15F',
  database : 'tcad_2017_2',
  wcadDB   : 'wcad_2017',
  debug    :  false,
  env : global.process.env.NODE_ENV || 'prod'
};

var development = {
  connectionLimit : 100, //important
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'tcad_2017_2',
  wcadDB   : 'wcad_2017',
  debug    :  false,
  env : global.process.env.NODE_ENV || 'dev'
};

exports.Config = global.process.env.NODE_ENV === 'prod' ? production : development;
