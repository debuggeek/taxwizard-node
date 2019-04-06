var rewire = require('rewire');
const chai = require("chai");
const expect = chai.expect;
const WcadFunctions = rewire("../wcadFunctions");

describe("WCAD function tests", () => {

    describe("calcLocationAdj", () => {
        calcLocationAdj = WcadFunctions.__get__('calcLocationAdj'); 
        it("test same hood", () => {
            let testSubj = {
                NeighborhoodCode: "A"
            };
            let testComp = {
                NeighborhoodCode: "A"
            };
            const result = calcLocationAdj(testSubj, testComp);
            expect(result).to.be.eq(0);
        });
        it("test diff hood", () => {
            let testSubj = {
                NeighborhoodCode: "A"
            };
            let testComp = {
                NeighborhoodCode: "B"
            };
            const result = calcLocationAdj(testSubj, testComp);
            expect(result).to.be.eq(22222222);
        });
    });
});