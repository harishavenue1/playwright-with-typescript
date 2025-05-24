import { Given, Then, After } from '@cucumber/cucumber';
import { chromium, Browser, Page } from 'playwright';
import { expect } from 'chai';

Given('I am on the {string} page', async function (url: string) {
  await this.page.goto(url);
});

Then('the page title should be {string}', async function (expectedTitle: string) {
  const page = this.page as Page;
  const title = await page.title();
  expect(title).to.equal(expectedTitle);
});

Then('I should see a visible {string} element', async function (selector: string) {
  const page = this.page as Page;
  const element = await page.$(selector);
  expect(await element?.isVisible()).to.be.true;
});