# My Playwright Project

This project is a sample setup for using Playwright with TypeScript and Cucumber (BDD). It includes a basic test suite, Cucumber step definitions, and configuration files to get you started with automated end-to-end testing.

## Prerequisites

- Node.js (version 12 or later)
- npm (Node package manager)

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/my-playwright-project.git
   ```

2. Navigate to the project directory:

   ```
   cd my-playwright-project
   ```

3. Install the dependencies:

   ```
   npm install
   ```

## Running Tests

### Playwright Tests

To run Playwright tests directly:

```
npx playwright test
```

### Cucumber BDD Tests

To run Cucumber BDD tests with Playwright and TypeScript:

```
npm run test:run
```

You can also use the following scripts for specific tags or retry logic (see `package.json` for more):

- Run API-tagged tests:  
  `npm run testApi`
- Run tests sequentially:   
  `npm run trs`
- Run tests parallely with retries:  
  `npm run trp`

## Project Structure

```
my-playwright-project
├── features/                   # Cucumber feature files
│   └── flight-booking.feature
├── steps/                      # Step definitions for Cucumber
│   └── flight-booking.steps.ts
├── pages/                      # Page Object Model classes
│   └── FlightBookingPage.ts
├── scripts/                    # Custom runner scripts
│   ├── runner.ts
│   └── rerun.ts
├── playwright.config.ts        # Playwright configuration
├── package.json                # npm configuration and scripts
├── tsconfig.json               # TypeScript configuration
└── README.md                   # Project documentation
```

## Usage

- Add or modify your test cases in the `features/` directory (Gherkin syntax).
- Implement or update step definitions in the `steps/` directory.
- Use the `pages/` directory for Page Object Model classes to keep your code organized and reusable.
- Adjust `playwright.config.ts` and `tsconfig.json` as needed for your environment.

## Notes

- The project supports both Playwright's native test runner and Cucumber for BDD.
- Handles both same-tab and new-tab navigations in step definitions.
- Uses robust selectors and waits for dynamic content (like headings) to appear before assertions.
- Environment variables like `MAX_RETRIES` and `PARALLEL` can be set to control test execution.

For more information on Playwright, visit the [Playwright documentation](https://playwright.dev/docs/intro).  
For Cucumber, see the [Cucumber.js documentation](https://github.com/cucumber/cucumber-js).