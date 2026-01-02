#!/usr/bin/env node
/**
 * API Contract Coverage Check
 * Ensures 100% of API endpoints have contract tests
 */

const fs = require('fs');
const path = require('path');

// Get all API routes
const API_DIR = path.join(__dirname, '../app/api');
const API_TESTS_DIR = path.join(__dirname, '../tests/api-contracts');

function getAllApiRoutes(dir, baseDir = dir) {
  const routes = [];
  if (!fs.existsSync(dir)) return routes;

  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      routes.push(...getAllApiRoutes(fullPath, baseDir));
    } else if (item.name === 'route.ts' || item.name === 'route.tsx') {
      const relativePath = path.relative(baseDir, dir);
      const routePath = '/api/' + relativePath.replace(/\\/g, '/');
      routes.push(routePath);
    }
  }

  return routes;
}

function findApiTests() {
  const tests = [];
  function scanDir(dir) {
    if (!fs.existsSync(dir)) return;

    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        scanDir(fullPath);
      } else if (item.name.endsWith('.test.ts') || item.name.endsWith('.spec.ts')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        tests.push(content);
      }
    }
  }

  scanDir(API_TESTS_DIR);
  return tests;
}

// Main check
const apiRoutes = getAllApiRoutes(API_DIR);

// Skip check if no API routes exist yet (early development)
if (apiRoutes.length === 0) {
  console.log('ℹ️  No API routes found yet - skipping API contract coverage check');
  console.log('   Add routes to app/api/ and corresponding tests to tests/api-contracts/');
  process.exit(0);
}

const apiTests = findApiTests().join('\n');
const missingRoutes = [];

for (const route of apiRoutes) {
  // Normalize route path for matching
  const routePath = route.replace(/\/$/, '');

  // Check if route is mentioned in any API contract test
  if (
    !apiTests.includes(routePath) &&
    !apiTests.includes(`'${routePath}'`) &&
    !apiTests.includes(`"${routePath}"`)
  ) {
    missingRoutes.push(routePath);
  }
}

if (missingRoutes.length > 0) {
  console.error('❌ 100% API contract coverage required\n');
  console.error('Missing API contract tests for endpoints:');
  missingRoutes.forEach((route) => console.error(`  ❌ ${route}`));
  console.error('\nPlease add API contract tests for these endpoints in tests/api-contracts/');
  console.error('Contract tests should verify request/response schemas match OpenAPI spec.');
  process.exit(1);
}

console.log('✅ 100% API contract coverage on all endpoints');
process.exit(0);
