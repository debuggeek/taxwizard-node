var Sequelize = require('Sequelize');
var db = require('../../lib/db.js');

const Land = db.sequelize.define('land', {
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
