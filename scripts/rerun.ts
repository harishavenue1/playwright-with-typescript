import { execSync } from 'child_process';
import * as fs from 'fs';

const rerunFile = 'reports/@rerun.txt';
const maxRetries = Number(process.env.MAX_RETRIES) || 3;
let exitCode = 0;
let lastAttempt = 0;

for (let attempt = 1; attempt <= maxRetries; attempt++) {
    if (fs.existsSync(rerunFile) && fs.readFileSync(rerunFile, 'utf-8').trim()) {
        lastAttempt = attempt;
        console.log(`Rerun attempt ${attempt} for failed scenarios...`);
        const rerunStartTime = Date.now();
        process.env.TEST_START_TIME = rerunStartTime.toString();
        process.env.REPORT_JSON_FILE = `reports/cucumber-report-rerun-attempt-${attempt}.json`;
        process.env.REPORT_HTML_FILE = `reports/cucumber-report-rerun-attempt-${attempt}.html`;

        const rerunCmd = `npx cucumber-js --require-module ts-node/register --require steps/**/*.ts ${rerunFile} --format summary --format json:reports/cucumber-report-rerun-attempt-${attempt}.json --format rerun:${rerunFile}`;
        try {
            execSync(rerunCmd, { stdio: 'inherit' });
            if (fs.readFileSync(rerunFile, 'utf-8').trim() === '') {
                console.log('✅ All rerun scenarios passed. Cleaning up rerun.txt.');
                //fs.unlinkSync(rerunFile);
            }
        } catch (err: any) {
            console.error(`❌ Rerun attempt ${attempt} failed scenarios still failing. Check the rerun report for details.`);
            exitCode = 1; // Do not print stacktrace
        }
        // Always generate the report
        execSync('node report.js', { stdio: 'inherit', env: process.env });
        break;
    } else {
        if (attempt === 1) {
            console.log('No failed scenarios to rerun.');
        }
        break;
    }
}

// --- List failed scenarios after all attempts ---
if (fs.existsSync(rerunFile) && fs.readFileSync(rerunFile, 'utf-8').trim()) {
    const failedLocations = fs.readFileSync(rerunFile, 'utf-8')
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean);

    const lastReport = `reports/cucumber-report-rerun-attempt-${lastAttempt}.json`;
    let failedNames: string[] = [];
    if (fs.existsSync(lastReport)) {
        const report = JSON.parse(fs.readFileSync(lastReport, 'utf-8'));
        for (const feature of report) {
            if (!feature.elements) continue;
            for (const scenario of feature.elements) {
                if (scenario.type === 'scenario' && scenario.steps.some((s: any) => s.result.status === 'failed')) {
                    failedNames.push(`${feature.name} - ${scenario.name}`);
                }
            }
        }
    }

    console.error('\n==============================');
    console.error(`❌ Failed scenarios after ${lastAttempt} attempts:`);
    failedNames.forEach((name, idx) => {
        console.error(`${idx + 1}. ${name}`);
    });
    console.error('==============================\n');
    exitCode = 1;
} else if (exitCode !== 0) {
    console.error('Some scenarios failed after all rerun attempts. Please check the rerun HTML reports for details.');
}

process.exit(exitCode);