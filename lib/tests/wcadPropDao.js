const chai = require("chai");
const expect = chai.expect;
const WcadPropDao = require("../wcadPropDao");

describe("Test getting property", function() {
    it("Test getPropertyByQuickRefId", async () => {
        let subjPropId = 329133;
        let quickRefId = "R520848";
        subjProp = await WcadPropDao.getPropertyByQuickRefId(quickRefId);
        console.log(JSON.stringify(subjProp));

        expect(subjProp).is.not.undefined;

        expect(subjProp.property).is.not.undefined;
        expect(subjProp.property.PropertyId).to.equal(subjPropId);

        expect(subjProp.improvements).is.not.undefined;

        expect(subjProp.land).is.not.undefined;

        expect(subjProp.summary).is.not.undefined;
    });

    it("Test getHydratedPropertyByPropertyId", async () => {
        let subjPropId = 62710;
        let quickRefId = "R000850";
        let result = await WcadPropDao.getHydratedPropertyByPropertyId(subjPropId);
        console.log("-------------getHydratedPropertyByPropertyId >>> result-------  " + JSON.stringify(result));

        let subjProp = result.property;
        expect(subjProp).is.not.undefined;
        expect(subjProp.improvements).is.not.undefined;
        expect(subjProp.land).is.not.undefined;
        expect(subjProp.quickRefId).to.be.eq(quickRefId);
    });

    it.skip("Compare old and new method", async () => {
        let subjPropId = 62710;
        let quickRefId = "R000850";
        old = await WcadPropDao.getPropertyByQuickRefId(quickRefId);

        newProp = await WcadPropDao.getHydratedPropertyByPropertyId(subjPropId);

        // _.isEqual(old, newProp);
        expect(JSON.stringify(old)).to.deep.equal(JSON.stringify(newProp));
    })
});

describe("Test finding comps", function() {
    let subjProp;

    before("test getPropertyByQuickRefId", async () => {
        let subjPropId = 62710;
        let quickRefId = 'R000850';
        subjProp = await WcadPropDao.getPropertyByQuickRefId(quickRefId);
        console.log(JSON.stringify(subjProp));

        expect(subjProp).is.not.undefined;
    });

    it("test getSalesComps", async () => {     
        let context = {
            "oldestDate": "2015-01-01", 
        };
        result = await WcadPropDao.getSalesCompsFor(context, subjProp.summary);
        console.log(JSON.stringify(result));
        expect(result).to.be.an('array');
        expect(result.length).to.be.greaterThan(0);
        
        const saleSample = result[0];
        expect(saleSample.PropertyID).to.not.be.undefined;
        expect(saleSample.SaleDate).to.not.be.undefined;
        expect(saleSample.TotalLandValue).to.not.be.undefined;
        expect(saleSample.TotalBuildingValue).to.not.be.undefined;
    });

    it("test getSalesComps missing date", async () => {     
        let context = {
        };
        result = await WcadPropDao.getSalesCompsFor(context, subjProp.summary);
        console.log(JSON.stringify(result));
        expect(result).to.be.an('array');
        expect(result.length).to.be.greaterThan(0);
        
        const saleSample = result[0];
        expect(saleSample.PropertyID).to.not.be.undefined;
        expect(saleSample.SaleDate).to.not.be.undefined;
        expect(saleSample.TotalLandValue).to.not.be.undefined;
        expect(saleSample.TotalBuildingValue).to.not.be.undefined;
    });

    it("test getHydratedSalesComps", async () => {     
        let context = {
            "oldestDate": "2015-01-01", 
            "percBelow": 0.90,
            "percAbove": 1.10
        };
        result = await WcadPropDao.getHydratedSalesComps(context, subjProp.summary);
        console.log(JSON.stringify(result));
        expect(result).to.be.an('array');
        expect(result.length).to.be.greaterThan(0);
        
        const saleSample = result[0].salesComp;
        console.log("--------getHydratedSalesComps>> saleSample------\n" + JSON.stringify(saleSample));
        expect(saleSample.PropertyID).to.not.be.undefined;
        expect(saleSample.SaleDate).to.not.be.undefined;
        expect(saleSample.TotalLandValue).to.not.be.undefined;
        expect(saleSample.TotalBuildingValue).to.not.be.undefined;
        expect(saleSample.Property.improvements).is.not.undefined;
        expect(saleSample.Property.land).is.not.undefined;

        const salesSummary = result[0].summary;
        expect(salesSummary).to.not.be.undefined;
    });
});