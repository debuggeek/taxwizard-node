const chai = require("chai");
const expect = chai.expect;
const SalesHistory = require("../wcad/salesHistory");

describe("Test Sales History", function() {
    it.only("Retrieve by Property Id", async () => {
        const testPropId = "65783";
        let testSale = await SalesHistory.findOne({ plain: true },{ where: { PropertyId: testPropId } });

        console.log(testSale);

        expect(testSale).to.not.be.undefined;
        expect(testSale).to.not.be.null;
        expect(testSale.PropertyId).to.equal(testPropId);
        expect(testSale.SaleDate).to.not.be.undefined;
        expect(testSale.TotalLandValue).to.not.be.undefined;
        expect(testSale.TotalBuildingValue).to.not.be.undefined;
    });
});