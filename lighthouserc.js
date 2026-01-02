module.exports = {
  ci: {
    collect: {
      // Test localhost during development
      url: ['http://localhost:3000/'],
      numberOfRuns: 3, // Run 3 times and take median
      settings: {
        // Use mobile viewport by default
        preset: 'desktop',
        // Skip PWA checks for now
        skipAudits: ['service-worker', 'installable-manifest'],
      },
    },
    assert: {
      // Performance budgets
      assertions: {
        'categories:performance': ['error', { minScore: 0.8 }], // 80+ score
        'categories:accessibility': ['error', { minScore: 0.9 }], // 90+ score
        'categories:best-practices': ['error', { minScore: 0.9 }], // 90+ score
        'categories:seo': ['error', { minScore: 0.9 }], // 90+ score

        // Specific performance metrics
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }], // 2s
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }], // 2.5s
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }], // 0.1
        'total-blocking-time': ['warn', { maxNumericValue: 300 }], // 300ms
      },
    },
    upload: {
      target: 'temporary-public-storage', // Free public storage for reports
    },
  },
};
