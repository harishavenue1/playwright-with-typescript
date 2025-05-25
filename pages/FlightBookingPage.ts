import { Page, Locator, expect } from '@playwright/test';
import { getDateFromRelative } from '../utils/step-utils';

export class FlightBookingPage {
    readonly page: Page;

    // Locators for fromAirport
    readonly searchInput: Locator;
    readonly fromAirportInput: Locator;
    readonly fromAirportCode: Locator;
    readonly fromAirportDesc: Locator;
    readonly toAirportInput: Locator;
    readonly tripTypeSelector: Locator;
    readonly departureDateInput: Locator;
    readonly arrivalDateInput: Locator;
    readonly airportCityOptions: Locator;

    // Locators for toAirport
    readonly toAirportCode: Locator;
    readonly toAirportDesc: Locator;
    readonly toArrivalCity: Locator;
    readonly toCountryCode: Locator;
    readonly toCity: Locator;

    // New locators for trip type dropdown
    readonly tripTypeDropdown: Locator;
    readonly tripTypeValue: Locator;
    readonly tripTypeIcon: Locator;
    readonly tripTypeOptions: Locator;

    // Locators for calendar/date selection
    readonly dateSelectorContainer: Locator;
    readonly departLabelContainer: Locator;
    readonly departDateSpan: Locator;
    readonly departDateInput: Locator;
    readonly returnLabelContainer: Locator;
    readonly returnDateSpan: Locator;
    readonly returnDateInput: Locator;

    // Footer Locators
    readonly footerSectionSelector = '.footer-content';
    readonly footerSectionHeadingSelector = 'h3, a[dropdowntoggle]';
    readonly footerLinkSelector = 'li a';

    // Add to class properties
    readonly departureDateInputSelector: Locator;
    readonly returnDateInputSelector: Locator;
    readonly datePicker: Locator;
    readonly nextMonthButton: Locator;
    readonly doneButton: Locator;
    readonly month0: Locator;
    readonly year0: Locator;
    readonly month1: Locator;
    readonly year1: Locator;
    readonly daySelectorTemplate = (groupIndex: number, day: number) =>
        `.dl-datepicker-group-${groupIndex} a.dl-state-default:not(.dl-state-disabled):text("${day}")`;

    constructor(page: Page) {
        this.page = page;
        this.fromAirportInput = this.page.locator('a#fromAirportName');
        this.fromAirportCode = this.fromAirportInput.locator('span.airport-code');
        this.fromAirportDesc = this.fromAirportInput.locator('span.airport-desc');//getThis
        this.toAirportInput = this.page.locator('a#toAirportName');
        this.tripTypeSelector = this.page.locator('[name="tripType"]');
        this.departureDateInput = this.page.locator('[name="departureDate"]');
        this.arrivalDateInput = this.page.locator('[name="arrivalDate"]');
        this.searchInput = this.page.locator('#search_input');
        this.airportCityOptions = this.page.locator('.search-result-container .airport-city');

        // toAirport locators
        this.toAirportCode = this.toAirportInput.locator('span.airport-code');
        this.toAirportDesc = this.toAirportInput.locator('span.airport-desc');//getThis
        this.toArrivalCity = this.toAirportInput.locator('input[name="arrivalCity"]');
        this.toCountryCode = this.toAirportInput.locator('input[name="toCountryCode"]');
        this.toCity = this.toAirportInput.locator('input[name="toCity"]');

        // trip type dropdown locators
        this.tripTypeDropdown = this.page.locator('span[role="combobox"][aria-owns="selectTripType-desc"]');
        this.tripTypeOptions = this.page.locator('ul#selectTripType-desc li[role="option"]');
        this.tripTypeValue = this.tripTypeDropdown.locator('span#selectTripType-val');//geThis
        this.tripTypeIcon = this.tripTypeDropdown.locator('span.select-ui-icon');

        // Calendar/date selection locators
        this.dateSelectorContainer = this.page.locator('div#input_returnDate_1');
        this.departLabelContainer = this.dateSelectorContainer.locator('span#calDepartLabelCont');
        this.departDateSpan = this.departLabelContainer.locator('span.calenderDepartSpan');//getThis
        this.departDateInput = this.departLabelContainer.locator('input[formcontrolname="departureDate"]');
        this.returnLabelContainer = this.dateSelectorContainer.locator('span#calReturnLabelCont');
        this.returnDateSpan = this.returnLabelContainer.locator('span.calenderReturnSpan');//geThis
        this.returnDateInput = this.returnLabelContainer.locator('input[formcontrolname="returnDate"]');
        this.departureDateInputSelector = this.page.locator('#input_departureDate_1');
        this.returnDateInputSelector = this.page.locator('#input_returnDate_1');

        // Initialize locators that require this.page
        this.datePicker = this.page.locator('.dl-datepicker');
        this.nextMonthButton = this.page.locator('.dl-datepicker-1');
        this.doneButton = this.page.locator('button.donebutton');
        this.month0 = this.page.locator('.dl-datepicker-month-0');
        this.year0 = this.page.locator('.dl-datepicker-year-0');
        this.month1 = this.page.locator('.dl-datepicker-month-1');
        this.year1 = this.page.locator('.dl-datepicker-year-1');
    }

    // Example methods for fetching code and description
    async getFromAirportCode(): Promise<string | null> {
        return await this.fromAirportCode.textContent();
    }

    async getFromAirportDescription(): Promise<string | null> {
        return await this.fromAirportDesc.textContent();
    }

    async getToAirportDescription(): Promise<string | null> {
        return await this.toAirportDesc.textContent();
    }

    async getTripTypeValue(): Promise<string | null> {
        return await this.tripTypeValue.textContent();
    }

    async getDepartDateSpan(): Promise<string | null> {
        return await this.departDateSpan.textContent();
    }

    async getReturnDateSpan(): Promise<string | null> {
        return await this.returnDateSpan.textContent();
    }

    getAirportCityOption(cityName: string): Locator {
        return this.airportCityOptions.filter({ hasText: cityName });
    }

    async validateFlightDetails(expected: Record<string, string>) {
        const actual: Record<string, string | null> = {
            fromAirport: await this.getFromAirportDescription(),
            toAirport: await this.getToAirportDescription(),
            tripType: await this.getTripTypeValue(),
            departureDate: await this.getDepartDateSpan(),
            arrivalDate: await this.getReturnDateSpan(),
        };

        for (const [key, expectedValue] of Object.entries(expected)) {
            let compareExpected = expectedValue;
            if ((key === 'fromAirport' || key === 'toAirport') && typeof expectedValue === 'string') {
                compareExpected = expectedValue.slice(4);
            }
            if (
                (key === 'departureDate' || key === 'arrivalDate') &&
                typeof expectedValue === 'string' &&
                expectedValue.trim() !== ''
            ) {
                const dateObj = getDateFromRelative(expectedValue);
                const month = dateObj.toLocaleString('default', { month: 'short' });
                const day = dateObj.getDate();
                compareExpected = `${month} ${day}`;
            }
            if (compareExpected !== actual[key]) {
                throw new Error(`Mismatch for ${key}: expected "${compareExpected}", got "${actual[key]}"`);
            }
        }
    }

    async gotoAndAcceptCookies() {
        await this.page.goto('https://www.delta.com/apac/en');
        try {
            await this.page.click('#onetrust-accept-btn-handler', { timeout: 10000 });
        } catch (e) {
            // Ignore if not present
        }
    }

    async selectAirport(airport: string, airportInput: Locator) {
        const [code, ...nameParts] = airport.split(' ');
        const airportCode = code;
        const airportName = nameParts.join(' ').trim();
        await airportInput.click();
        await this.searchInput.fill(airportCode);
        await this.getAirportCityOption(airportName).waitFor({ state: 'visible' });
        await this.getAirportCityOption(airportName).click();
    }

    async selectFromAirport(fromAirport: string) {
        await this.selectAirport(fromAirport, this.fromAirportInput);
    }

    async selectToAirport(toAirport: string) {
        await this.selectAirport(toAirport, this.toAirportInput);
    }

    async selectTripType(tripType: string) {
        await this.tripTypeDropdown.click();
        await this.tripTypeOptions.filter({ hasText: tripType }).first().click();
    }

    // Clicks a footer link by section and link name, scrolls into view for screenshot
    async clickFooterLink(
        section: string,
        linkName: string,
        testInfo: { attach: (name: string, options: { body: Buffer, contentType: string }) => Promise<void | Page> }
    ): Promise<void | import('@playwright/test').Page> {
        try {
            const sectionLocator = this.page.locator(this.footerSectionSelector).filter({
                has: this.page.locator(this.footerSectionHeadingSelector).filter({ hasText: section })
            });
            const linkLocators = sectionLocator.locator(this.footerLinkSelector).filter({ hasText: linkName });
            const count = await linkLocators.count();

            // Helper for scroll, screenshot, attach, and click
            const prepareAndClick = async (link: Locator) => {
                const elementHandle = await link.elementHandle();
                if (elementHandle) {
                    await this.page.evaluate(
                        (el) => el.scrollIntoView({ block: 'center', behavior: 'auto' }),
                        elementHandle
                    );
                }
                const screenshot = await this.page.screenshot();
                await testInfo.attach('footer-link', { body: screenshot, contentType: 'image/png' });
                await link.click();
            };

            let found = false;
            for (let i = 0; i < count; i++) {
                const link = linkLocators.nth(i);
                if (await link.isVisible()) {
                    const targetAttr = await link.getAttribute('target');
                    if (targetAttr === '_blank') {
                        // New tab/window
                        const [newPage] = await Promise.all([
                            this.page.context().waitForEvent('page').catch(() => null),
                            prepareAndClick(link)
                        ]);
                        if (newPage) {
                            await newPage.waitForLoadState('domcontentloaded');
                            return newPage;
                        }
                    } else {
                        // Same tab navigation
                        await Promise.all([
                            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => { }),
                            prepareAndClick(link)
                        ]);
                    }
                    found = true;
                    break;
                }
            }
            if (!found) {
                throw new Error(`No visible link found for "${linkName}" in section "${section}"`);
            }
        } catch (error) {
            console.error(`Error clicking footer link "${linkName}" in section "${section}":`, error);
            throw new Error(`Failed to click footer link "${linkName}" in section "${section}": ${error}`);
        }
    }

    // Returns the HTTP status of the current page
    async getCurrentPageStatus(): Promise<number> {
        try {
            const url = this.page.url();
            const response = await this.page.request.get(url);
            return response.status();
        } catch (error) {
            console.error(`Error getting page status:`, error);
            throw new Error(`Failed to get page status: ${error}`);
        }
    }

    async waitForHeadingText(expectedHeading: string, timeout = 20000): Promise<void> {
        await this.page.locator(`:has-text("${expectedHeading}")`).first().waitFor({ state: 'visible', timeout });
    }

    getDayLocator(groupIndex: number, day: number): Locator {
        return this.page.locator(this.daySelectorTemplate(groupIndex, day));
    }

    // add comments to below methods
    /**
     * Selects a date in the date picker for either departure or arrival.
     * @param date - The date to select, can be relative (e.g., "tomorrow", "next week").
     * @param depart_arrival - Specifies whether to select for 'departure' or 'arrival'.
     */
    async selectDate(date: string, depart_arrival: string) {
        try {
            // Return early if no date is provided
            if (!date || date.trim() === '') return;

            // Parse the date (supports relative dates like "tomorrow")
            const dateObj = getDateFromRelative(date);
            const year = dateObj.getFullYear();
            const month = dateObj.toLocaleString('default', { month: 'long' });
            const day = dateObj.getDate();

            // Choose the correct input selector based on trip type
            const dateInputSelector =
                depart_arrival === 'departure'
                    ? this.departureDateInputSelector
                    : depart_arrival === 'arrival'
                        ? this.returnDateInputSelector
                        : null;

            // Throw error if trip type is invalid
            if (!dateInputSelector) {
                throw new Error(`Invalid trip type "${depart_arrival}"`);
            }

            // Open the date picker
            await dateInputSelector.click();
            await this.datePicker.waitFor({ state: 'visible' });

            // Navigate to the correct month/year in the date picker (max 24 attempts)
            let foundMonth = false;
            for (let i = 0; i < 24; i++) {
                const visibleMonth0 = (await this.month0.textContent())?.trim();
                const visibleYear0 = (await this.year0.textContent())?.trim();
                const visibleMonth1 = (await this.month1.textContent())?.trim();
                const visibleYear1 = (await this.year1.textContent())?.trim();

                // Check if either calendar group shows the desired month/year
                if (
                    (visibleMonth0 === month && visibleYear0 === year.toString()) ||
                    (visibleMonth1 === month && visibleYear1 === year.toString())
                ) {
                    foundMonth = true;
                    break;
                }
                // Click next month and wait a bit before checking again
                await this.nextMonthButton.click();
                await this.page.waitForTimeout(200);
            }
            // If not found after 24 attempts, throw error
            if (!foundMonth) {
                throw new Error(`Could not find month "${month} ${year}" in date picker after 24 attempts.`);
            }

            // Determine which calendar group (0 or 1) contains the desired month/year
            let groupIndex = -1;
            const visibleMonth0 = (await this.month0.textContent())?.trim();
            const visibleYear0 = (await this.year0.textContent())?.trim();
            const visibleMonth1 = (await this.month1.textContent())?.trim();
            const visibleYear1 = (await this.year1.textContent())?.trim();

            if (visibleMonth0 === month && visibleYear0 === year.toString()) {
                groupIndex = 0;
            } else if (visibleMonth1 === month && visibleYear1 === year.toString()) {
                groupIndex = 1;
            } else {
                throw new Error(`Could not find month "${month} ${year}" in date picker.`);
            }

            // Find all enabled day links in the correct group
            const dayLinks = await this.getDayLocator(groupIndex, day).all();
            let found = false;
            for (const link of dayLinks) {
                // Check for exact text match with the desired day
                const text = (await link.textContent())?.trim();
                if (text === day.toString()) {
                    await link.click(); // Click the correct day
                    found = true;
                    break;
                }
            }
            // Throw error if the day was not found/enabled
            if (!found) {
                throw new Error(`Could not find enabled day "${day}" in "${month} ${year}" in date picker.`);
            }

            // Click the "done" button to confirm date selection
            await this.doneButton.click();

            // Wait for the date picker to close before proceeding
            await this.datePicker.waitFor({ state: 'hidden' });
        } catch (error) {
            // Log and rethrow any errors for debugging
            console.error(`Error selecting date "${date}" for "${depart_arrival}":`, error);
            throw error;
        }
    }
}

