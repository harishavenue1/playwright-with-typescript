"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cucumber_1 = require("@cucumber/cucumber");
const playwright_1 = require("playwright");
const cucumber_2 = require("@cucumber/cucumber");
(0, cucumber_1.Before)({ tags: '@api' }, async function () {
    this.response = null;
});
(0, cucumber_1.After)({ tags: '@api' }, async function () {
    if (this.response) {
        console.log('Response:', this.response);
    }
});
// Set a default timeout for all steps
(0, cucumber_2.setDefaultTimeout)(30 * 1000);
(0, cucumber_1.Before)({ tags: '@ui' }, async function () {
    this.browser = await playwright_1.chromium.launch({ headless: false });
    this.page = await this.browser.newPage();
});
(0, cucumber_1.After)({ tags: '@ui' }, async function () {
    if (this.page) {
        const screenshot = await this.page.screenshot();
        if (this.attach)
            await this.attach(screenshot, 'image/png');
        await this.page.close();
    }
    if (this.browser) {
        await this.browser.close();
    }
});
