const reporter = require('cucumber-html-reporter');
const fs = require('fs');
const path = require('path');

const startTime = process.env.TEST_START_TIME
  ? new Date(Number(process.env.TEST_START_TIME))
  : new Date();
const endTime = new Date();

const jsonFile = process.env.REPORT_JSON_FILE || 'reports/cucumber-report.json';
const outputHtml = process.env.REPORT_HTML_FILE || 'reports/cucumber-report.html';

// Detect if this is a rerun report and extract attempt number
const rerunMatch = outputHtml.match(/rerun-attempt-(\d+)/);
const isRerun = outputHtml.includes('rerun');
const rerunAttempt = rerunMatch ? rerunMatch[1] : null;

const options = {
  theme: 'bootstrap',
  jsonFile,
  output: outputHtml,
  reportSuiteAsScenarios: true,
  scenarioTimestamp: true,
  launchReport: true,
  brandTitle: isRerun
    ? rerunAttempt
      ? `Cucumber Report - Rerun Attempt #${rerunAttempt}`
      : 'Cucumber Report - Rerun (Failed Scenarios)'
    : 'Cucumber Report - Full Run',
  metadata: {
    "Report Type": isRerun
      ? rerunAttempt
        ? `Rerun (Attempt #${rerunAttempt})`
        : "Rerun (Failed Scenarios)"
      : "Full Run",
    "Rerun Attempt": rerunAttempt || (isRerun ? "Yes" : "No"),
    "Start Time": startTime.toLocaleString(),
    "End Time": endTime.toLocaleString(),
    "Executed Tags": process.env.TAGS || 'All',
    "Executed Mode": process.env.PARALLEL ? 'Parallel' : 'Sequential',
    "Test Environment": process.env.TEST_ENV || 'Local',
    "Platform": process.platform,
    "Node Version": process.version
  }
};

reporter.generate(options);

// ---- Consolidated Tag-wise Pass/Fail Table ----
const reportsDir = path.join(__dirname, 'reports');
const allJsonFiles = fs.readdirSync(reportsDir)
  .filter(f => f.startsWith('cucumber-report') && f.endsWith('.json'))
  .map(f => path.join(reportsDir, f))
  .sort(); // Ensure order: main run first, reruns later

// Map: scenarioId -> { tags: [], status: 'pass'|'fail' }
const scenarioFinalStatus = {};

for (const file of allJsonFiles) {
  const report = JSON.parse(fs.readFileSync(file, 'utf-8'));
  for (const feature of report) {
    if (!feature.elements) continue;
    for (const scenario of feature.elements) {
      if (scenario.type !== 'scenario') continue;
      // Use a unique scenario id: uri + line (or name if line not available)
      const scenarioId = (scenario.uri ? scenario.uri : feature.uri || feature.id || feature.name) + ':' + (scenario.line || scenario.id || scenario.name);
      const tags = (scenario.tags || []).map(t => t.name.replace(/^@/, ''));
      const status = scenario.steps.some(s => s.result.status === 'failed') ? 'fail' : 'pass';
      // Always overwrite: last file wins (final status)
      scenarioFinalStatus[scenarioId] = { tags, status };
    }
  }
}

// Now aggregate tag-wise counts from final scenario statuses
const tagStats = {};
for (const { tags, status } of Object.values(scenarioFinalStatus)) {
  for (const tag of tags) {
    if (!tagStats[tag]) tagStats[tag] = { pass: 0, fail: 0 };
    tagStats[tag][status]++;
  }
}

// Print consolidated table to console
const tagNames = Object.keys(tagStats);
if (tagNames.length) {
  console.log('\nConsolidated Tag-wise Pass/Fail Summary (Final Status Only):');
  console.log('---------------------------------------');
  console.log('| Tag           | Passed | Failed     |');
  console.log('---------------------------------------');
  for (const tag of tagNames) {
    const { pass, fail } = tagStats[tag];
    console.log(`| ${tag.padEnd(14)} | ${String(pass).padEnd(6)} | ${String(fail).padEnd(10)} |`);
  }
  console.log('---------------------------------------\n');
} else {
  console.log('\nNo tags found in scenarios.\n');
}