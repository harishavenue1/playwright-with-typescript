"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cucumber_1 = require("@cucumber/cucumber");
const chai_1 = require("chai");
(0, cucumber_1.Given)('I am on the {string} page', async function (url) {
    await this.page.goto(url);
});
(0, cucumber_1.Then)('the page title should be {string}', async function (expectedTitle) {
    const page = this.page;
    const title = await page.title();
    (0, chai_1.expect)(title).to.equal(expectedTitle);
});
(0, cucumber_1.Then)('I should see a visible {string} element', async function (selector) {
    const page = this.page;
    const element = await page.$(selector);
    (0, chai_1.expect)(await element?.isVisible()).to.be.true;
});
