const chai = require("chai");
const expect = chai.expect;
const WcadBizOps = require("../wcadBizOps");
const findComps = WcadBizOps.findComps;


describe("Test findComps", function() {
    it("test sqft", async () => {
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
        expect(subject.sales, "subject.sales should be defined").to.not.be.undefined;
        expect(subject.sales).to.not.be.null;
        console.log("Subject sales:", subject.sales);

        expect(result.comps).to.be.an('array');
        expect(result.comps.length).to.be.greaterThan(0);
    });
});