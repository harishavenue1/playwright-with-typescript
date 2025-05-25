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
    const flightPage = new FlightBookingPage(this.page);
    await flightPage.selectDate(date, depart_arrival);
});

Then('the selected flight details should be:', async function (dataTable) {
    const flightPage = new FlightBookingPage(this.page);
    const expected = Object.fromEntries(dataTable.rawTable.slice(1));
    await flightPage.validateFlightDetails(expected);
});

When('I click the {string} link in the About Delta footer section', async function (linkName: string) {
    try {
        const flightPage = new FlightBookingPage(this.page);
        const newPage = await flightPage.clickFooterLink('About Delta', linkName, {
            attach: async (_name: string, options: { body: Buffer, contentType: string }) => {
                this.attach(options.body, options.contentType);
            }
        });
        if (newPage) {
            this.page = newPage; // <-- Update the World context for subsequent steps
        }
    } catch (err) {
        console.error('Error clicking About Delta footer link:', err);
        throw err;
    }
});

Then('I should be navigated to a page containing {string}', async function (expectedHeader) {
    try {
        const flightPage = new FlightBookingPage(this.page);
        await flightPage.waitForHeadingText(expectedHeader);
    } catch (err) {
        console.error('Error verifying navigation to expected page:', err);
        throw err;
    }
});