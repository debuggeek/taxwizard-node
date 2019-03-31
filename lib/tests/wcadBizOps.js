const chai = require("chai");
const expect = chai.expect;
const WcadBizOps = require("../wcadBizOps");
const findComps = WcadBizOps.findComps;


describe("Test Bizops findComps", function() {
    it("test non sales", async () => {
        queryParams = {
            "quickRefId": "R009534", 
            "percAbove": 1.10,
            "percBelow": .90,
            "sales": false
        };
        result = await findComps(queryParams);
        expect(result).is.not.null;
        expect(result.subject).is.not.null;
        
        const subject = result.subject;
        expect(subject.PropertyId, "subject.PropertyId should be defined").to.not.be.undefined;
        console.log("Subject PropertyId:", subject.PropertyId);

        expect(result.comps).to.be.an('array');
        expect(result.comps.length).to.be.greaterThan(0);
    });

    it.only("test sales with sqft limit and date", async () => {
        queryParams = {
            "quickRefId": "R009534", 
            "percAbove": 1.10,
            "percBelow": .90,
            "oldestDate": "2013-01-01",
            "sales": true
        };
        result = await findComps(queryParams);
        console.log("-------------test sales >>> result---------\n", JSON.stringify(result));
        expect(result).is.not.undefined;

        const subject = result.subject;
        expect(subject).to.not.be.undefined;
        expect(subject.quickRefId).to.be.eq(queryParams.quickRefId);

        expect(result.comps).to.be.an('array');
        expect(result.comps.length).to.be.greaterThan(0);
        const comp1 = result.comps[0];
        expect(comp1.SaleDate, "comp1.SaleDate should be defined").to.not.be.undefined;
        expect(comp1.SalePrice).to.be.greaterThan(0);
    });

    it("test sales with sqft limit", async () => {
        queryParams = {
            "quickRefId": "R009534", 
            "percAbove": 1.10,
            "percBelow": .90,
            "sales": true
        };
        result = await findComps(queryParams);
        console.log("-------------test sales >>> result---------\n", JSON.stringify(result));
        expect(result).is.not.undefined;

        const subject = result.subject;
        expect(subject).to.not.be.undefined;
        expect(subject.quickRefId).to.be.eq(queryParams.quickRefId);

        expect(result.comps).to.be.an('array');
        expect(result.comps.length).to.be.greaterThan(0);
        const comp1 = result.comps[0];
        expect(comp1.SaleDate, "comp1.SaleDate should be defined").to.not.be.undefined;
        expect(comp1.SalePrice).to.be.greaterThan(0);
    });

    it("test sales without sqft limit", async () => {
        queryParams = {
            "quickRefId": "R009534", 
            "sales": true
        };
        result = await findComps(queryParams);
        console.log("-------------test sales without sqft limit >>> result---------\n", JSON.stringify(result));
        expect(result).is.not.undefined;

        const subject = result.subject;
        expect(subject).to.not.be.undefined;
        expect(subject.quickRefId).to.be.eq(queryParams.quickRefId);

        expect(result.comps).to.be.an('array');
        expect(result.comps.length).to.be.greaterThan(0);
        const comp1 = result.comps[0];
        expect(comp1.SaleDate, "comp1.SaleDate should be defined").to.not.be.undefined;
        expect(comp1.SalePrice).to.be.greaterThan(0);
    });
});