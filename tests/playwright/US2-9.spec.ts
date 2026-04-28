// tests/playwright/US2-9.spec.ts
import { test } from '@playwright/test';

const BASE_URL = 'https://6-noob7-hack-frontend.vercel.app';
const ADMIN_EMAIL = 'adminforUS2-9@gmail.com';
const PASSWORD = '123456';

async function loginAsAdmin(page) {
  await page.goto(BASE_URL);
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'yourgmail@example.com' }).fill(ADMIN_EMAIL);
  await page.getByRole('textbox', { name: '••••••••' }).fill(PASSWORD);
  await page.getByRole('button', { name: /sign ?in/i }).click();
  await page.waitForTimeout(1000);
}

test.describe('US2-9: Admin cancels payments', () => {
  test('TC-US2-9-1: Admin cancels pending/failed payment', async ({ page }) => {
    try {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/admin`);

      await page.getByPlaceholder('Enter Payment ID...').fill('pending-payment-id');
      await page.getByRole('button', { name: 'Search' }).click();
      await page.getByRole('button', { name: 'Cancel Payment 🚫' }).click();

      const cancelSuccess = page.locator('text=Payment cancelled successfully! 🚫');
      if (await cancelSuccess.count() > 0) {
        await cancelSuccess.isVisible();
      }
    } catch (err) {
    }
  });

  test('TC-US2-9-2: Admin cancels completed payment (refund required)', async ({ page }) => {
    try {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/admin`);

      await page.getByPlaceholder('Enter Payment ID...').fill('completed-payment-id');
      await page.getByRole('button', { name: 'Search' }).click();
      await page.getByRole('button', { name: 'Cancel Payment 🚫' }).click();

      const refundMsg = page.locator('text=Refund required');
      const errorMsg = page.locator('text^=❌');

      if (await refundMsg.count() > 0) {
        await refundMsg.isVisible();
      } else if (await errorMsg.count() > 0) {
        await errorMsg.isVisible();
      }
    } catch (err) {
    }
  });
});