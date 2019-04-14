const chai = require("chai");
const expect = chai.expect;
const batchSettings = require("../batchSettings");

describe("Test Batch Settings", function() {
    it("Test get settings", async () => {
        let result = await batchSettings.getCurrBatchSettings();
        // console.log(result);
        expect(result).to.not.be.undefined;
        expect(Object.keys(result).length).to.be.eq(32);
        expect(result.MaxDisplay).to.be.greaterThan(0);
    });

    it("Test update settings", async () => {
        let initial = await batchSettings.getCurrBatchSettings();
        // Change 1 field
        let newSetting = {
            "TrimIndicated": initial.TrimIndicated ? 0 : 1,
            "MaxDisplay": initial.MaxDisplay * 2
        }
        let updateResult = await batchSettings.updateCurrBatchSettings(newSetting);
        expect(updateResult.serverStatus).to.be.eq(2);

        let update = await batchSettings.getCurrBatchSettings();
        
        expect(initial).to.not.be.undefined;
        expect(update).to.not.be.undefined;
        console.log("update >> ", update);
        expect(initial).to.not.be.deep.eq(update);

        // Return table to expected
        newSetting = {
            "TrimIndicated": update.TrimIndicated ? 0 : 1,
            "MaxDisplay": update.MaxDisplay / 2
        }
        updateResult = await batchSettings.updateCurrBatchSettings(newSetting);
        expect(updateResult.serverStatus).to.be.eq(2);
    });
});