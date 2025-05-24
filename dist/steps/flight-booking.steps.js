"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cucumber_1 = require("@cucumber/cucumber");
const chai_1 = require("chai");
const step_utils_1 = require("../utils/step-utils");
(0, cucumber_1.Given)('I am on the flight booking page', async function () {
    await this.page.goto('https://www.delta.com/apac/en');
});
(0, cucumber_1.When)('I select {string} as the from airport', async function (fromAirport) {
    const [code, ...nameParts] = fromAirport.split(' ');
    const airportCode = code;
    const airportName = nameParts.join(' ').trim();
    await this.page.click('#fromAirportName');
    await this.page.fill('#search_input', airportCode);
    await this.page.waitForSelector('.search-result-container .airport-list', { state: 'visible' });
    await this.page.click(`.search-result-container .airport-list .airport-city:has-text("${airportName}")`);
});
(0, cucumber_1.When)('I select {string} as the to airport', async function (toAirport) {
    const [code, ...nameParts] = toAirport.split(' ');
    const airportCode = code;
    const airportName = nameParts.join(' ').trim();
    await this.page.click('#toAirportName');
    await this.page.fill('#search_input', airportCode);
    await this.page.waitForSelector('.search-result-container .airport-list', { state: 'visible' });
    await this.page.click(`.search-result-container .airport-list .airport-city:has-text("${airportName}")`);
});
(0, cucumber_1.When)('I select {string} as the trip type', async function (tripType) {
    await this.page.click('span[aria-labelledby="selectTripType-label"]');
    await this.page.click(`li[role="option"]:has-text("${tripType}")`);
});
(0, cucumber_1.When)('I select {string} as the departure date', async function (departureDate) {
    const dateObj = (0, step_utils_1.getDateFromRelative)(departureDate);
    const year = dateObj.getFullYear();
    const month = dateObj.toLocaleString('default', { month: 'long' });
    const day = dateObj.getDate();
    console.log(`Selected date: ${year}-${month}-${day}`);
    await this.page.click('#input_departureDate_1');
    await this.page.waitForSelector('.dl-datepicker', { state: 'visible' });
    // Navigate to the correct month/year
    while (true) {
        const visibleMonth0 = (await this.page.textContent('.dl-datepicker-month-0'))?.trim();
        const visibleYear0 = (await this.page.textContent('.dl-datepicker-year-0'))?.trim();
        const visibleMonth1 = (await this.page.textContent('.dl-datepicker-month-1'))?.trim();
        const visibleYear1 = (await this.page.textContent('.dl-datepicker-year-1'))?.trim();
        if ((visibleMonth0 === month && visibleYear0 === year.toString()) ||
            (visibleMonth1 === month && visibleYear1 === year.toString())) {
            break;
        }
        await this.page.click('.dl-datepicker-1');
        await this.page.waitForTimeout(200);
    }
    // Click the correct day
    await this.page.click(`.dl-datepicker-available-day a:has-text("${day} ${month} ${year}")`);
});
(0, cucumber_1.When)('I select {string} as the return date', async function (returnDate) {
    await this.page.click('#input_departureDate_1');
    // Add logic to pick the return date from the calendar widget
    // Example: await this.page.click(`[data-date="${returnDate}"]`);
});
(0, cucumber_1.Then)('the form should reflect my selections', async function () {
    // Add assertions to verify the form fields have the correct values
    const from = await this.page.inputValue('input[name="fromCity"]');
    const to = await this.page.inputValue('input[name="toCity"]');
    (0, chai_1.expect)(from).to.include('Bangalore');
    (0, chai_1.expect)(to).to.include('Delhi');
    // Add more assertions for trip type and dates as needed
});
