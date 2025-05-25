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

    constructor(page: Page) {
        this.page = page;
        this.fromAirportInput = page.locator('a#fromAirportName');
        this.fromAirportCode = this.fromAirportInput.locator('span.airport-code');
        this.fromAirportDesc = this.fromAirportInput.locator('span.airport-desc');//getThis
        this.toAirportInput = page.locator('a#toAirportName');
        this.tripTypeSelector = page.locator('[name="tripType"]');
        this.departureDateInput = page.locator('[name="departureDate"]');
        this.arrivalDateInput = page.locator('[name="arrivalDate"]');
        this.searchInput = page.locator('#search_input');
        this.airportCityOptions = page.locator('.search-result-container .airport-city');

        // toAirport locators
        this.toAirportCode = this.toAirportInput.locator('span.airport-code');
        this.toAirportDesc = this.toAirportInput.locator('span.airport-desc');//getThis
        this.toArrivalCity = this.toAirportInput.locator('input[name="arrivalCity"]');
        this.toCountryCode = this.toAirportInput.locator('input[name="toCountryCode"]');
        this.toCity = this.toAirportInput.locator('input[name="toCity"]');

        // trip type dropdown locators
        this.tripTypeDropdown = page.locator('span[role="combobox"][aria-owns="selectTripType-desc"]');
        this.tripTypeOptions = page.locator('ul#selectTripType-desc li[role="option"]');
        this.tripTypeValue = this.tripTypeDropdown.locator('span#selectTripType-val');//geThis
        this.tripTypeIcon = this.tripTypeDropdown.locator('span.select-ui-icon');

        // Calendar/date selection locators
        this.dateSelectorContainer = page.locator('div#input_returnDate_1');
        this.departLabelContainer = this.dateSelectorContainer.locator('span#calDepartLabelCont');
        this.departDateSpan = this.departLabelContainer.locator('span.calenderDepartSpan');//getThis
        this.departDateInput = this.departLabelContainer.locator('input[formcontrolname="departureDate"]');
        this.returnLabelContainer = this.dateSelectorContainer.locator('span#calReturnLabelCont');
        this.returnDateSpan = this.returnLabelContainer.locator('span.calenderReturnSpan');//geThis
        this.returnDateInput = this.returnLabelContainer.locator('input[formcontrolname="returnDate"]');
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
    async clickFooterLink(section: string, linkName: string, testInfo: { attach: (name: string, options: { body: Buffer, contentType: string }) => Promise<void | Page> }) {
        try {
            const sectionLocator = this.page.locator(this.footerSectionSelector).filter({
                has: this.page.locator(this.footerSectionHeadingSelector).filter({ hasText: section })
            });
            const linkLocators = sectionLocator.locator(this.footerLinkSelector).filter({ hasText: linkName });
            const count = await linkLocators.count();
            let found = false;
            for (let i = 0; i < count; i++) {
                const link = linkLocators.nth(i);
                if (await link.isVisible()) {
                    // Check if the link opens in a new tab
                    const targetAttr = await link.getAttribute('target');
                    if (targetAttr === '_blank') {
                        // New tab/window
                        const [newPage] = await Promise.all([
                            this.page.context().waitForEvent('page').catch(() => null),
                            (async () => {
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
                            })()
                        ]);
                        if (newPage) {
                            await newPage.waitForLoadState('domcontentloaded');
                            return newPage;
                        }
                    } else {
                        // Same tab navigation
                        await Promise.all([
                            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => { }),
                            (async () => {
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
                            })()
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
}

