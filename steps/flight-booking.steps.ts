import { Given, When, Then } from '@cucumber/cucumber';
import { chromium, Browser, Page } from 'playwright';
import { expect } from 'chai';
import { parseISO, addDays, format } from 'date-fns';
import { getDateFromRelative } from '../utils/step-utils';
import { TIMEOUTS } from '../utils/timeout-config';

Given('I am on the flight booking page', async function () {
    await this.page.goto('https://www.delta.com/apac/en');
    // Try to click the "Accept All" button if it appears
    try {
        await this.page.click('#onetrust-accept-btn-handler', { timeout: TIMEOUTS.GLOBAL });
    } catch (e) {
        // Ignore if not present
    }
});

When('I select {string} as the from airport', async function (fromAirport: string) {
    const [code, ...nameParts] = fromAirport.split(' ');
    const airportCode = code;
    const airportName = nameParts.join(' ').trim();
    await this.page.click('#fromAirportName');
    await this.page.fill('#search_input', airportCode);
    await this.page.waitForSelector('.search-result-container .airport-list', { state: 'visible' });
    await this.page.click(`.search-result-container .airport-list .airport-city:has-text("${airportName}")`);
});

When('I select {string} as the to airport', async function (toAirport: string) {
    const [code, ...nameParts] = toAirport.split(' ');
    const airportCode = code;
    const airportName = nameParts.join(' ').trim();
    await this.page.click('#toAirportName');
    await this.page.fill('#search_input', airportCode);
    await this.page.waitForSelector('.search-result-container .airport-list', { state: 'visible' });
    await this.page.click(`.search-result-container .airport-list .airport-city:has-text("${airportName}")`);
});

When('I select {string} as the trip type', async function (tripType: string) {
    await this.page.click('span[aria-labelledby="selectTripType-label"]');
    await this.page.click(`li[role="option"]:has-text("${tripType}")`);
});

When('I select {string} as the {string} date', async function (date: string, depart_arrival: string) {
    try {
        if (!date || date.trim() === '') {
            // Skip if arrivalDate is empty (for One Way)
            return;
        }
        const dateObj = getDateFromRelative(date);
        const year = dateObj.getFullYear();
        const month = dateObj.toLocaleString('default', { month: 'long' });
        const day = dateObj.getDate();
        console.log(`Formatted Date: ${year}-${month}-${day}`);

        const dateInputSelector =
            depart_arrival === 'departure'
                ? '#input_departureDate_1'
                : depart_arrival === 'arrival'
                    ? '#input_returnDate_1'
                    : null;

        if (!dateInputSelector) {
            throw new Error(`Invalid trip type "${depart_arrival}"`);
        }
        await this.page.click(dateInputSelector);
        await this.page.waitForSelector('.dl-datepicker', { state: 'visible' });

        // Navigate to the correct month/year
        let foundMonth = false;
        for (let i = 0; i < 24; i++) { // prevent infinite loop
            const visibleMonth0 = (await this.page.textContent('.dl-datepicker-month-0'))?.trim();
            const visibleYear0 = (await this.page.textContent('.dl-datepicker-year-0'))?.trim();
            const visibleMonth1 = (await this.page.textContent('.dl-datepicker-month-1'))?.trim();
            const visibleYear1 = (await this.page.textContent('.dl-datepicker-year-1'))?.trim();

            if (
                (visibleMonth0 === month && visibleYear0 === year.toString()) ||
                (visibleMonth1 === month && visibleYear1 === year.toString())
            ) {
                foundMonth = true;
                break;
            }
            await this.page.click('.dl-datepicker-1');
            await this.page.waitForTimeout(200);
        }
        if (!foundMonth) {
            throw new Error(`Could not find month "${month} ${year}" in date picker after 24 attempts.`);
        }

        // Find the correct calendar group (0 or 1)
        let groupIndex = -1;
        const visibleMonth0 = (await this.page.textContent('.dl-datepicker-month-0'))?.trim();
        const visibleYear0 = (await this.page.textContent('.dl-datepicker-year-0'))?.trim();
        const visibleMonth1 = (await this.page.textContent('.dl-datepicker-month-1'))?.trim();
        const visibleYear1 = (await this.page.textContent('.dl-datepicker-year-1'))?.trim();

        if (visibleMonth0 === month && visibleYear0 === year.toString()) {
            groupIndex = 0;
        } else if (visibleMonth1 === month && visibleYear1 === year.toString()) {
            groupIndex = 1;
        } else {
            throw new Error(`Could not find month "${month} ${year}" in date picker.`);
        }

        // Now select the day only within the correct group
        const daySelector = `.dl-datepicker-group-${groupIndex} a.dl-state-default:has-text("${day}")`;
        const dayExists = await this.page.$(daySelector);
        if (!dayExists) {
            throw new Error(`Could not find enabled day "${day}" in "${month} ${year}" in date picker for the locator ${daySelector}.`);
        }
        await this.page.click(daySelector);

        // Click the "done" button to confirm date selection
        await this.page.click('button.donebutton');

        // Wait for the date picker to close
        await this.page.waitForSelector('.dl-datepicker', { state: 'hidden' });
        console.log(`Selected date: ${year}-${month}-${day}` + ` for ${depart_arrival}`);
    } catch (err) {
        // Log and rethrow for Cucumber to show in the report
        console.error('Date picker selection failed:', err);
        throw err;
    }
});

Then('the form should reflect my selections', async function () {
    // Add assertions to verify the form fields have the correct values
    const from = await this.page.inputValue('input[name="fromCity"]');
    const to = await this.page.inputValue('input[name="toCity"]');
    expect(from).to.include('Bangalore');
    expect(to).to.include('Delhi');
    // Add more assertions for trip type and dates as needed
});