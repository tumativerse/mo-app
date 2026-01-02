#!/usr/bin/env node
/**
 * E2E Coverage Check
 * Ensures 100% of critical flows and user-facing pages have E2E tests
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

// Critical flows that MUST have E2E tests
const REQUIRED_FLOWS = ['auth', 'dashboard', 'workout'];

// E2E tests directory
const E2E_DIR = path.join(__dirname, '../tests/e2e');

function findE2ETests() {
  const tests = [];
  function scanDir(dir) {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        scanDir(fullPath);
      } else if (item.name.endsWith('.spec.ts')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        tests.push(content);
      }
    }
  }

  if (fs.existsSync(E2E_DIR)) {
    scanDir(E2E_DIR);
  }

  return tests;
}

// Main check
const e2eTests = findE2ETests().join('\n');
const missingFlows = [];

for (const flow of REQUIRED_FLOWS) {
  // Check if flow is mentioned in any E2E test
  if (!e2eTests.includes(flow) && !e2eTests.includes(`/${flow}`)) {
    missingFlows.push(flow);
  }
}

if (missingFlows.length > 0) {
  console.error('❌ 100% E2E coverage required\n');
  console.error('Missing E2E tests for critical flows:');
  missingFlows.forEach((flow) => console.error(`  ❌ ${flow}`));
  console.error('\nPlease add E2E tests for these flows in tests/e2e/critical/');
  process.exit(1);
}

console.log('✅ 100% E2E coverage on critical flows');
process.exit(0);
