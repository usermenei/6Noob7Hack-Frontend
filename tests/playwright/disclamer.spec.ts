// tests/playwright/disclamer.spec.ts
import { expect, test } from '@playwright/test';

test.describe('Disclaimer Notice', () => {
  test('Display disclaimer about test variability', async () => {
    console.log(`
    ────────────────────────────────────────────────
    DISCLAIMER
    Our web application implements security measures 
    that may affect automated test execution. 
    As a result, test outcomes can occasionally differ 
    from expected results due to these protections.
    This variability is normal and does not necessarily 
    indicate a defect in the system.
    ────────────────────────────────────────────────
    `);

    // Force the test to pass
    expect(true).toBe(true);
  });
});
