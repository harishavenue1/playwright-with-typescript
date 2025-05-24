import { execSync } from 'child_process';
import * as process from 'process';
import * as fs from 'fs';

// Clean and prepare reports folder
execSync('rm -rf reports && mkdir -p reports', { stdio: 'inherit' });

// Set start time as an environment variable
const startTime = Date.now();
process.env.TEST_START_TIME = startTime.toString();

// Read tags and parallel from env or use defaults
const tags = process.env.TAGS || '';
const parallel = process.env.PARALLEL || '';
const maxRetries = Number(process.env.MAX_RETRIES) || 3;
const format = 'json:reports/cucumber-report.json';

// Build the cucumber-js command
let cucumberCmd = `npx cucumber-js --require-module ts-node/register --require steps/**/*.ts features/**/*.feature --format summary --format ${format}`;
if (tags) cucumberCmd += ` --tags ${tags}`;
if (parallel) cucumberCmd += ` --parallel ${parallel}`;

// append reRun logic
cucumberCmd += ` --format rerun:reports/@rerun.txt`;

let exitCode = 0;
try {
    console.log(`Running Cucumber tests with command: ${cucumberCmd}`);
    execSync(cucumberCmd, { stdio: 'inherit', env: process.env });
} catch (err: any) {
    exitCode = err.status || 1;
}

// Always generate the report
execSync('node report.js', { stdio: 'inherit', env: process.env });

// Check if rerun.txt exists and is not empty
const rerunFile = 'reports/@rerun.txt';
if (fs.existsSync(rerunFile) && fs.readFileSync(rerunFile, 'utf-8').trim()) {
    console.log('Detected failed scenarios. Starting rerun attempts...');
    // Call rerun.ts (using ts-node)
    let cucumberCmd = `ts-node scripts/rerun.ts`;
    if (maxRetries) cucumberCmd = `MAX_RETRIES=${maxRetries} ts-node scripts/rerun.ts`;
    try {
        execSync(cucumberCmd, { stdio: 'inherit', env: process.env });
    } catch (err) {
        // Suppress stacktrace, print friendly message
        console.error(`[${require('path').basename(__filename)}] Some scenarios failed after all rerun attempts. Please check the rerun HTML reports for details.`);
        exitCode = 1;
    }
} else {
    console.log('No failed scenarios detected.');
}

process.exit(exitCode);