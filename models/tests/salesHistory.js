const chai = require("chai");
const expect = chai.expect;
const SalesHistory = require("../wcad/salesHistory");

describe("Test Sales History", function() {
    it("Retrieve by Property Id", async () => {
        const testPropId = 62710;
        let result = await SalesHistory.findAndCountAll({ where: { PropertyID: testPropId } });
        console.log(JSON.stringify(result));

        expect(result.count).to.be.greaterThan(0);
        let testSale = result.rows[0];
        console.log(JSON.stringify(testSale));

        expect(testSale).to.not.be.undefined;
        expect(testSale).to.not.be.null;
        expect(testSale.PropertyID).to.equal(testPropId);
        expect(testSale.SaleDate).to.not.be.undefined;
        expect(testSale.TotalLandValue).to.not.be.undefined;
        expect(testSale.TotalBuildingValue).to.not.be.undefined;
        expect(testSale.NeighborhoodCode).to.not.be.undefined;
        expect(testSale.NeighborhoodCode.length).to.be.greaterThan(0);
    });
});