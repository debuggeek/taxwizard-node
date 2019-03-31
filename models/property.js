let Sequelize = require('sequelize');
let sequelize = require('../lib/db.js').sequelize;
let SaleHistory = require('./wcad/salesHistory');
let Improvement = require('./improvement');
let Land = require('./wcad/tsgland');

class Property extends Sequelize.Model {}
Property.init(
  {
    PropertyId : {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    quickRefId : Sequelize.STRING,
    Acres : Sequelize.FLOAT,
    SitusAddress : Sequelize.STRING,
    PropertyAddress : Sequelize.STRING,
    NeighborhoodCode : Sequelize.STRING,
    //Acres: Sequelize.INTEGER,
    TotalSqFtLivingArea : Sequelize.INTEGER,
    // LivingAreaValue : Sequelize.INTEGER,
    //Improvement Value
    TotalImpMktValue : Sequelize.INTEGER,
    TotalLandMktValue : Sequelize.INTEGER,
    TotalAssessedValue : Sequelize.INTEGER
  }, 
  {
    timestamps: false,
    tableName: 'PROPERTY',
    sequelize
  }
);

Property.hasMany(SaleHistory, {as: 'Sales', foreignKey: 'PropertyId'});
Property.hasMany(Improvement, {as: 'improvements', foreignKey: 'PropertyId'});
Property.hasOne(Land, {as: 'land', foreignKey: 'PropertyId'});
Improvement.belongsTo(Property, {foreignKey: 'PropertyId'});
Land.belongsTo(Property, {foreignKey: 'PropertyId'});
SaleHistory.belongsTo(Property, {foreignKey: 'PropertyID'});

module.exports = Property;
