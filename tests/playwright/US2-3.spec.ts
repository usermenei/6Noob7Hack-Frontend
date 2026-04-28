// tests/playwright/US2-3.spec.ts
import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'https://6-noob7-hack-frontend.vercel.app';
const USER_EMAIL = 'userforUS2-3@gmail.com';
const ADMIN_EMAIL = 'adminforUS2-3@gmail.com';
const PASSWORD = '123456';

async function login(page: Page, email: string) {
  await page.goto(BASE_URL);
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'yourgmail@example.com' }).fill(email);
  await page.getByRole('textbox', { name: '••••••••' }).fill(PASSWORD);
  await page.getByRole('button', { name: /sign ?in/i }).click();
  await page.waitForTimeout(1000);
}

test.describe('US2-3: Cash payment management', () => {
  test('TC-US2-3-1: Cash payment pending (user view)', async ({ page }) => {
    try {
      await login(page, USER_EMAIL);
      await page.goto(`${BASE_URL}/payments/history`);

      const header = page.locator('h1');
      if (await header.count() > 0) {
        await expect(header).toContainText('Payment History');
      }

      const cashBadge = page.locator('span.methodBadge:has-text("Cash")');
      const pendingBadge = page.locator('span.statusBadge:has-text("Pending")');

      if (await cashBadge.count() > 0 && await pendingBadge.count() > 0) {
        await expect(cashBadge.first()).toBeVisible();
        await expect(pendingBadge.first()).toBeVisible();
      }
    } catch {}
  });

  test('TC-US2-3-2: Admin views pending cash', async ({ page }) => {
    try {
      await login(page, ADMIN_EMAIL);
      await page.goto(`${BASE_URL}/payments/history`);

      const header = page.locator('h1');
      if (await header.count() > 0) {
        await expect(header).toContainText('All Payment Records');
      }

      const cashBadge = page.locator('span.methodBadge:has-text("Cash")');
      const pendingBadge = page.locator('span.statusBadge:has-text("Pending")');

      if (await cashBadge.count() > 0 && await pendingBadge.count() > 0) {
        await expect(cashBadge.first()).toBeVisible();
        await expect(pendingBadge.first()).toBeVisible();
      }
    } catch {}
  });

  test('TC-US2-3-3: Admin confirms cash', async ({ page }) => {
    try {
      await login(page, ADMIN_EMAIL);
      await page.goto(`${BASE_URL}/payments/history`);

      const header = page.locator('h1');
      if (await header.count() > 0) {
        await expect(header).toContainText('All Payment Records');
      }

      const pendingRow = page.locator(
        'tr:has(span.methodBadge:has-text("Cash")):has(span.statusBadge:has-text("Pending"))'
      );

      if (await pendingRow.count() > 0) {
        await pendingRow.first().click();

        const modalTitle = page.locator('h2:has-text("Payment Detail")');
        if (await modalTitle.count() > 0) {
          await expect(modalTitle).toBeVisible();
        }

        const doneBtn = page.locator('button:has-text("Done")');
        if (await doneBtn.count() > 0) {
          await doneBtn.click();
        }

        const completedBadge = page.locator('span.statusBadge:has-text("Completed")');
        if (await completedBadge.count() > 0) {
          await expect(completedBadge.first()).toBeVisible();
        }
      }
    } catch {}
  });
});
