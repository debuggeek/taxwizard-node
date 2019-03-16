const chai = require("chai");
const expect = chai.expect;
const WcadBizOps = require("../wcadBizOps");
const findComps = WcadBizOps.findComps;


describe("Test findComps", function() {
    it("test sqft", () => {
        queryParams = {
            "quickRefId": "R009534", 
            "percAbove": 10,
            "percBelow": 10,
            "sales": false
        };
        result = findComps(queryParams);
        expect(result).is.not.null;
    });
});