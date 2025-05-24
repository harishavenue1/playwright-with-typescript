import { Before, After } from '@cucumber/cucumber';
import { BeforeStep, AfterStep } from '@cucumber/cucumber';
import { setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, firefox, webkit } from 'playwright';
import config from '../playwright.config'; // adjust path as needed

Before({ tags: '@api' }, async function () {
    this.response = null;
});

After({ tags: '@api' }, async function () {
    if (this.response) {
        const preview =
            Array.isArray(this.response.data)
                ? JSON.stringify(this.response.data.slice(0, 2), null, 2) + (this.response.data.length > 2 ? ' ...' : '')
                : typeof this.response.data === 'object'
                    ? JSON.stringify(Object.keys(this.response.data).slice(0, 5), null, 2) + ' ...'
                    : String(this.response.data);
        console.log(`Response: { status: ${this.response.status}, data: ${preview} }`);
    }
});

// Set a default timeout for all steps
setDefaultTimeout(30 * 1000);

Before({ tags: '@ui' }, async function () {
    const browserType = { chromium, firefox, webkit }[config.use?.browserName || 'chromium'];
    // Prefer env variable, fallback to config, then default to true
    const headless =
        process.env.UI_MODE
            ? process.env.UI_MODE !== 'ui' && process.env.UI_MODE !== 'Y'
            : config.use?.headless ?? true;
    //print headless value
    console.log('Headless mode:', headless);
    this.browser = await browserType.launch({ headless });

    // Set user agent when creating context
    const context = await this.browser.newContext({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 800 },
        locale: 'en-US'
    });

    this.page = await context.newPage();
});

After({ tags: '@ui' }, async function () {
    if (this.page) {
        const screenshot = await this.page.screenshot();
        if (this.attach) await this.attach(screenshot, 'image/png');
        await this.page.close();
    }
    if (this.browser) {
        await this.browser.close();
    }
});

BeforeStep(function ({ pickle, pickleStep }) {
    const scenario = pickle.name;
    const step = pickleStep.text;
    const time = new Date().toLocaleTimeString();
    console.log(`[${time}] [${scenario}] START Step : ${step}`);
});

AfterStep(function ({ pickle, pickleStep }) {
    const scenario = pickle.name;
    const step = pickleStep.text;
    const time = new Date().toLocaleTimeString();
    if (this.attach) {
        this.attach(`Step Executed at: [${time}]`, 'text/plain');
    }
    console.log(`[${time}] [${scenario}] END Step   : ${step}`);
});