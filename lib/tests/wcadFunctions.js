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

    describe("calcLocationAdj", () => {
        calcLocationFactor = WcadFunctions.__get__('calcLocationFactor'); 
        it("test same hood", () => {
            let testSubj = {
                NeighborhoodCode: "A"
            };
            let testComp = {
                NeighborhoodCode: "A"
            };
            const result = calcLocationFactor(testSubj, testComp);
            expect(result).to.be.eq(1);
        });
        it("test diff hood", () => {
            let testSubj = {
                NeighborhoodCode: "A"
            };
            let testComp = {
                NeighborhoodCode: "B"
            };
            const result = calcLocationFactor(testSubj, testComp);
            expect(result).to.be.eq(99999999);
        });
    });

    describe("calcAdjustedSalePriceAdj", () => {
        calcAdjustedSalePriceAdj = WcadFunctions.__get__('calcAdjustedSalePriceAdj'); 
        it("test full sales adj calculation", () => {
            const testComp = {
                SalePrice: 302923,
                timeAdj: 7573,
                livingAreaValueAdj: -752,
                locationAdj: 0,
                deprecationAdj: -1000,
                nonLivingAreaValueAdj: -5134,
                landValueAdj: 0
            };
            const result = calcAdjustedSalePriceAdj(testComp);
            expect(result).to.be.eq(303610);
        });

        it("test sales adj calculation missing data", () => {
            const testComp = {
                SalePrice: 302923,
                timeAdj: 7573,
                livingAreaValueAdj: -752,
                locationAdj: 0,
                deprecationAdj: -1000,
                nonLivingAreaValueAdj: -5134,
            };
            const result = calcAdjustedSalePriceAdj(testComp);
            expect(result).to.be.eq(77777777);
        });
    });
});