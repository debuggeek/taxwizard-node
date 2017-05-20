var Sequelize = require('Sequelize');
var db = require('../lib/db.js');

const Property = db.sequelize.define('property', {
    PropertyId : {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    quickRefId : Sequelize.STRING,
    Acres : Sequelize.FLOAT,
    SitusAddress : Sequelize.STRING,
    PropertyAddress : Sequelize.STRING,
    NeighborhoodCode : Sequelize.STRING,
    // Acres: Sequelize.INTEGER,
    TotalSqFtLivingArea : Sequelize.INTEGER,
    // LivingAreaValue : Sequelize.INTEGER,
    //Improvement Value
    TotalImpMktValue : Sequelize.INTEGER,
    TotalLandMktValue : Sequelize.INTEGER,
    TotalAssessedValue : Sequelize.INTEGER
  }, {
    timestamps: false,
    tableName: 'PROPERTY'
  }
);
module.exports = Property;
