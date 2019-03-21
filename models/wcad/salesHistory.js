var Sequelize = require('sequelize');
var db = require('../../lib/db.js');

const SaleHistory = db.sequelize.define('saleshistory', 
    {
        PropertyID : {
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        SaleDate : Sequelize.DATEONLY,
        TotalLandValue : Sequelize.FLOAT,
        TotalBuildingValue : Sequelize.FLOAT
    },
    {
        timestamps: false,
        tableName: 'SalesHistory'
    }
);

module.exports = SaleHistory