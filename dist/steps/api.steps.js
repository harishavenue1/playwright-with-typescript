"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cucumber_1 = require("@cucumber/cucumber");
const chai_1 = require("chai");
const axios_1 = __importDefault(require("axios"));
(0, cucumber_1.When)('I send a GET request to {string}', async function (url) {
    try {
        const response = await axios_1.default.get(url);
        this.response = response;
    }
    catch (error) {
        this.response = error.response;
    }
});
(0, cucumber_1.Then)('the response status should be {int}', function (status) {
    (0, chai_1.expect)(this.response.status).to.equal(status);
});
(0, cucumber_1.Then)('the response should contain a {string} in every item', function (key) {
    const data = this.response.data;
    (0, chai_1.expect)(Array.isArray(data)).to.be.true;
    data.forEach((item) => {
        (0, chai_1.expect)(item).to.have.property(key);
    });
});
(0, cucumber_1.Then)('the response should contain {string} as {int}', function (key, value) {
    const data = this.response.data;
    (0, chai_1.expect)(data[key]).to.equal(value);
});
(0, cucumber_1.Then)('the response array length should be {int}', async function (length) {
    const data = this.response.data;
    (0, chai_1.expect)(Array.isArray(data)).to.be.true;
    (0, chai_1.expect)(data.length).to.equal(length);
    // Attach the array to the report (as JSON string)
    if (this.attach) {
        await this.attach(`Response array (${data.length} items):\n` + JSON.stringify(data, null, 2), 'text/plain');
    }
});
(0, cucumber_1.Then)('the object at index {int} should have {int} keys', function (index, keyCount) {
    const data = this.response.data;
    (0, chai_1.expect)(Array.isArray(data)).to.be.true;
    (0, chai_1.expect)(Object.keys(data[index]).length).to.equal(keyCount);
});
(0, cucumber_1.Then)('the object at index {int} should have the following:', async function (index, dataTable) {
    const data = this.response.data;
    (0, chai_1.expect)(Array.isArray(data)).to.be.true;
    const obj = data[index];
    const expected = dataTable.rowsHash();
    // Check number of keys
    try {
        (0, chai_1.expect)(Object.keys(obj).length).to.equal(Object.keys(expected).length);
    }
    catch (e) {
        const msg = `Key count mismatch: actual keys=${JSON.stringify(Object.keys(obj))}, expected keys=${JSON.stringify(Object.keys(expected))}`;
        console.error(msg);
        if (this.attach)
            await this.attach(msg);
        throw e;
    }
    // Check each key and value
    for (const [key, value] of Object.entries(expected)) {
        const expectedValue = isNaN(Number(value)) ? value : Number(value);
        try {
            (0, chai_1.expect)(obj).to.have.property(key, expectedValue);
        }
        catch (e) {
            const msg = `Mismatch for key "${key}": actual="${obj[key]}", expected="${expectedValue}"`;
            console.error(msg);
            if (this.attach)
                await this.attach(msg);
            throw e;
        }
    }
});
(0, cucumber_1.Then)('attach all userIds from the response array', async function () {
    const data = this.response.data;
    (0, chai_1.expect)(Array.isArray(data)).to.be.true;
    const userIds = data.map((item) => item.userId);
    // Count occurrences of each userId
    const userIdCounts = {};
    userIds.forEach((id) => {
        userIdCounts[id] = (userIdCounts[id] || 0) + 1;
    });
    // Prepare report text
    const repeated = Object.entries(userIdCounts)
        .filter(([_, count]) => count > 1)
        .map(([id, count]) => `userId ${id}: ${count} times`)
        .join('\n') || 'No repeated userIds.';
    const reportText = `All userIds:\n${JSON.stringify(userIds, null, 2)}\n\n` +
        `Repeated userIds with counts:\n${repeated}`;
    console.log(reportText);
    if (this.attach) {
        await this.attach(reportText, 'text/plain');
    }
});
