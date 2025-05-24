import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import { getDateFromRelative } from '../utils/step-utils';
import { TIMEOUTS } from '../utils/timeout-config';
import { FlightBookingPage } from '../pages/FlightBookingPage';

Given('I am on the flight booking page', async function () {
    const flightPage = new FlightBookingPage(this.page);
    await flightPage.gotoAndAcceptCookies()
});

When('I select {string} as the from airport', async function (fromAirport: string) {
    const flightPage = new FlightBookingPage(this.page);
    await flightPage.selectFromAirport(fromAirport);
});

When('I select {string} as the to airport', async function (toAirport: string) {
    const flightPage = new FlightBookingPage(this.page);
    await flightPage.selectToAirport(toAirport);
});

When('I select {string} as the trip type', async function (tripType: string) {
    const flightPage = new FlightBookingPage(this.page);
    await flightPage.selectTripType(tripType);
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

Then('the selected flight details should be:', async function (dataTable) {
    const flightPage = new FlightBookingPage(this.page);
    const expected = Object.fromEntries(dataTable.rawTable.slice(1));
    await flightPage.validateFlightDetails(expected);
});