var Sequelize = require('sequelize');
var sequelize = require('../../lib/db.js').sequelize;
var Property = require('../property');

class SaleHistory extends Sequelize.Model {}
SaleHistory.init(
    {
        PropertyID: {
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        SaleDate: Sequelize.DATEONLY,
        TotalLandValue: Sequelize.FLOAT,
        TotalBuildingValue: Sequelize.FLOAT,
        NeighborhoodCode: Sequelize.STRING,
        SalePrice: {
            type: Sequelize.VIRTUAL,
            get(){
                return this.getDataValue('TotalBuildingValue') + this.getDataValue('TotalLandValue');
            }
        }
    }, 
    { 
        timestamps: false, 
        tableName: 'SalesHistory',
        sequelize 
    }
);

module.exports = SaleHistory