var Sequelize = require('sequelize');
var db = require('../lib/db.js');

const Improvement = db.sequelize.define('improvement', {
    PropertyId : Sequelize.INTEGER,
    InstanceID : {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    firstPage : Sequelize.INTEGER,
    fEffYear : Sequelize.INTEGER,
    fSegClass : Sequelize.STRING,
    fActYear : Sequelize.INTEGER,
    fArea : Sequelize.INTEGER,
    fSegType : Sequelize.INTEGER,
    vTSGRSeg_AdjFactor : Sequelize.INTEGER,
    vTSGRSeg_SegmentValue : Sequelize.INTEGER

  }, {
    timestamps: false,
    tableName: 'IMPSEGREALPROP'
  }
);

// Improvement.belongsTo(Property);

// Property.hasMany(Improvement, {
//   as: 'Improvements',
//   // foreignKey: 'PropertyId'
// });

// Improvement.belongsTo(Property, {
//   foreignKey : 'PropertyId',
//   targetKey : 'PropertyId'
// })

module.exports = Improvement;
