#!/usr/bin/env node
/**
 * Accessibility Coverage Check
 * Ensures 100% of user-facing pages have accessibility tests
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

// Get all app pages
const APP_DIR = path.join(__dirname, '../app/(app)');
const A11Y_DIR = path.join(__dirname, '../tests/accessibility');

function getAllPages(dir, baseDir = dir) {
  const pages = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      pages.push(...getAllPages(fullPath, baseDir));
    } else if (item.name === 'page.tsx' || item.name === 'page.ts') {
      const relativePath = path.relative(baseDir, dir);
      pages.push('/' + relativePath.replace(/\\/g, '/'));
    }
  }

  return pages;
}

function findA11yTests() {
  const tests = [];
  function scanDir(dir) {
    if (!fs.existsSync(dir)) return;

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

  scanDir(A11Y_DIR);
  return tests;
}

// Main check
const appPages = getAllPages(APP_DIR);

// Skip check if no pages exist yet (early development)
if (appPages.length === 0) {
  console.log('ℹ️  No pages found in app/(app)/ yet - skipping accessibility coverage check');
  console.log('   Add pages to app/(app)/ and corresponding tests to tests/accessibility/');
  process.exit(0);
}

const a11yTests = findA11yTests().join('\n');
const missingPages = [];

for (const page of appPages) {
  // Normalize page path for matching
  const pagePath = page === '/' ? '/' : page.replace(/\/$/, '');

  // Check if page is mentioned in any accessibility test
  if (
    !a11yTests.includes(pagePath) &&
    !a11yTests.includes(`'${pagePath}'`) &&
    !a11yTests.includes(`"${pagePath}"`)
  ) {
    missingPages.push(pagePath);
  }
}

if (missingPages.length > 0) {
  console.error('❌ 100% accessibility coverage required\n');
  console.error('Missing accessibility tests for pages:');
  missingPages.forEach((page) => console.error(`  ❌ ${page}`));
  console.error('\nPlease add accessibility tests for these pages in tests/accessibility/');
  process.exit(1);
}

console.log('✅ 100% accessibility coverage on all pages');
process.exit(0);
