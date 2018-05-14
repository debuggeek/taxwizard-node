var Sequelize = require('sequelize');
var db = require('../../lib/db.js');

const Land = db.sequelize.define('tsgland', {
    PropertyId : {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    FirstPage : Sequelize.INTEGER,
    fAcLandSize : Sequelize.FLOAT,
    fLandTable : Sequelize.STRING
  }, {
    timestamps: false,
    tableName: 'tsgland'
  }
);

module.exports = Land;
