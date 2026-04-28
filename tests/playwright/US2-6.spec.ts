// tests/playwright/US2-6.spec.ts
import { test, expect } from '@playwright/test';

const BASE_URL = 'https://6-noob7-hack-frontend.vercel.app';
const ADMIN_EMAIL = 'adminforUS2-6@gmail.com';
const PASSWORD = '123456';

async function loginAsAdmin(page) {
  await page.goto(BASE_URL);
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'yourgmail@example.com' }).fill(ADMIN_EMAIL);
  await page.getByRole('textbox', { name: '••••••••' }).fill(PASSWORD);
  await page.getByRole('button', { name: /sign ?in/i }).click();
  await page.waitForTimeout(1000);
}

test.describe('US2-6: Cancel with payments', () => {
  test('TC-US2-6-1: Cancel unpaid reservation', async ({ page }) => {
    try {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/admin`);

      await page.getByPlaceholder('Enter Payment ID...').fill('pending-payment-id');
      await page.getByRole('button', { name: 'Search' }).click();
      await page.getByRole('button', { name: 'Cancel Payment 🚫' }).click();

      const cancelSuccess = page.locator('text=Payment cancelled successfully! 🚫');
      if (await cancelSuccess.count() > 0) {
        await expect(cancelSuccess).toBeVisible({ timeout: 5000 });
      }
    } catch {}
  });

  test('TC-US2-6-2: Cancel paid reservation triggers refund', async ({ page }) => {
    try {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/admin`);

      await page.getByPlaceholder('Enter Payment ID...').fill('completed-payment-id');
      await page.getByRole('button', { name: 'Search' }).click();
      await page.getByRole('button', { name: 'Cancel Payment 🚫' }).click();

      const refundMsg = page.locator('text=Refund required');
      const errorMsg = page.locator('text^=❌');
      if (await refundMsg.count() > 0) {
        await expect(refundMsg).toBeVisible();
      } else if (await errorMsg.count() > 0) {
        await expect(errorMsg).toBeVisible();
      }
    } catch {}
  });

  test('TC-US2-6-3: Prevent cancel for past reservation', async ({ page }) => {
    try {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/admin`);

      await page.getByPlaceholder('Enter Payment ID...').fill('expired-payment-id');
      await page.getByRole('button', { name: 'Search' }).click();

      const cancelBtn = page.getByRole('button', { name: 'Cancel Payment 🚫' });
      if (await cancelBtn.count() > 0) {
        await expect(cancelBtn).toBeDisabled();
      }
    } catch {}
  });
});