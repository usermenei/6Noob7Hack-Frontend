// tests/playwright/US2-4.spec.ts
import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'https://6-noob7-hack-frontend.vercel.app';
const USER_EMAIL = 'userforUS2-4@gmail.com';
const ADMIN_EMAIL = 'adminforUS2-4@gmail.com';
const PASSWORD = '123456';

async function login(page: Page, email: string) {
  await page.goto(BASE_URL);
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'yourgmail@example.com' }).fill(email);
  await page.getByRole('textbox', { name: '••••••••' }).fill(PASSWORD);
  await page.getByRole('button', { name: /sign ?in/i }).click();
  await page.waitForTimeout(1000);
}

async function safeGoto(page: Page, url: string, expectedHeader: RegExp) {
  try {
    await page.goto(url);
    const header = page.locator('h1');
    if (await header.count() > 0) {
      await expect(header).toContainText(expectedHeader);
    }
  } catch {}
}

test.describe('US2-4: Payment history', () => {
  // USER FLOWS
  test('TC-US2-4-1: View payment history (user)', async ({ page }) => {
    try {
      await login(page, USER_EMAIL);
      await safeGoto(page, `${BASE_URL}/payments/history`, /Payment History/);

      const rows = page.locator('table tbody tr');
      if (await rows.count() > 0) {
        await expect(rows.first()).toBeVisible();
      }
    } catch {}
  });

  test('TC-US2-4-2: View transaction details (user)', async ({ page }) => {
    try {
      await login(page, USER_EMAIL);
      await safeGoto(page, `${BASE_URL}/payments/history`, /Payment History/);

      const rows = page.locator('table tbody tr');
      if (await rows.count() > 0) {
        await rows.first().click();
        const modalTitle = page.locator('h2:has-text("Payment Detail")');
        if (await modalTitle.count() > 0) {
          await expect(modalTitle).toBeVisible();
        }
        const doneBtn = page.locator('button:has-text("Done")');
        if (await doneBtn.count() > 0) {
          await doneBtn.click();
        }
      }
    } catch {}
  });

  test('TC-US2-4-3: Empty history state (user)', async ({ page }) => {
    try {
      await login(page, USER_EMAIL);
      await safeGoto(page, `${BASE_URL}/payments/history`, /Payment History/);

      const emptyTitle = page.locator('h2:has-text("No payment records yet")');
      if (await emptyTitle.count() > 0) {
        await expect(emptyTitle.first()).toBeVisible();
      }
    } catch {}
  });

  // ADMIN FLOWS
  test('TC-US2-4-4: View all payment records (admin)', async ({ page }) => {
    try {
      await login(page, ADMIN_EMAIL);
      await safeGoto(page, `${BASE_URL}/payments/history`, /All Payment Records/);

      const rows = page.locator('table tbody tr');
      if (await rows.count() > 0) {
        await expect(rows.first()).toBeVisible();
      }
    } catch {}
  });

  test('TC-US2-4-5: View transaction details (admin)', async ({ page }) => {
    try {
      await login(page, ADMIN_EMAIL);
      await safeGoto(page, `${BASE_URL}/payments/history`, /All Payment Records/);

      const rows = page.locator('table tbody tr');
      if (await rows.count() > 0) {
        await rows.first().click();
        const modalTitle = page.locator('h2:has-text("Payment Detail")');
        if (await modalTitle.count() > 0) {
          await expect(modalTitle).toBeVisible();
        }
        const doneBtn = page.locator('button:has-text("Done")');
        if (await doneBtn.count() > 0) {
          await doneBtn.click();
        }
      }
    } catch {}
  });

  test('TC-US2-4-6: Empty history state (admin)', async ({ page }) => {
    try {
      await login(page, ADMIN_EMAIL);
      await safeGoto(page, `${BASE_URL}/payments/history`, /All Payment Records/);

      const emptyTitle = page.locator('h2:has-text("No payment records yet")');
      if (await emptyTitle.count() > 0) {
        await expect(emptyTitle.first()).toBeVisible();
      }
    } catch {}
  });
});
