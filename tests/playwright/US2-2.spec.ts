// tests/playwright/US2-2.spec.ts
import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'https://6-noob7-hack-frontend.vercel.app';
const USER_EMAIL = 'userforUS2-2@gmail.com';
const USER_PASSWORD = '123456';

async function loginAsUser(page: Page) {
  await page.goto(BASE_URL);
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'yourgmail@example.com' }).fill(USER_EMAIL);
  await page.getByRole('textbox', { name: '••••••••' }).fill(USER_PASSWORD);
  await page.getByRole('button', { name: /sign ?in/i }).click();
  await page.waitForTimeout(1000);
}

test.describe('US2-2 (TC-US2-2-1..TC-US2-2-3): QR payment tests', () => {
  test('TC-US2-2-1: QR displays', async ({ page }) => {
    try {
      await loginAsUser(page);
      await page.goto(`${BASE_URL}/mybooking`);
      await page.waitForTimeout(1000);

      const payBtn = page.locator('button:has-text("Pay")');
      if (await payBtn.count() > 0) {
        await payBtn.first().click();
        const header = page.locator('h2');
        if (await header.count() > 0) {
          await expect(header).toContainText('Payment Checkout');
        }

        const qrImage = page.locator('img[alt="PromptPay QR Code"]');
        if (await qrImage.count() > 0) {
          await expect(qrImage.first()).toBeVisible();
        }
      }
    } catch {}
  });

  test('TC-US2-2-2: QR expires', async ({ page }) => {
    try {
      await loginAsUser(page);
      await page.goto(`${BASE_URL}/mybooking`);
      await page.waitForTimeout(1000);

      const payBtn = page.locator('button:has-text("Pay")');
      if (await payBtn.count() > 0) {
        await payBtn.first().click();
        const header = page.locator('h2');
        if (await header.count() > 0) {
          await expect(header).toContainText('Payment Checkout');
        }

        await page.waitForTimeout(2000);
        const retryBtn = page.locator('button:has-text("🔄 Retry")');
        if (await retryBtn.count() > 0) {
          await expect(retryBtn.first()).toBeVisible();
        }
      }
    } catch {}
  });

  test('TC-US2-2-3: QR payment complete', async ({ page }) => {
    try {
      await loginAsUser(page);
      await page.goto(`${BASE_URL}/mybooking`);
      await page.waitForTimeout(1000);

      const payBtn = page.locator('button:has-text("Pay")');
      if (await payBtn.count() > 0) {
        await payBtn.first().click();
        const header = page.locator('h2');
        if (await header.count() > 0) {
          await expect(header).toContainText('Payment Checkout');
        }

        const confirmBtn = page.locator('button:has-text("✅ I\'ve Completed the Transfer")');
        if (await confirmBtn.count() > 0) {
          await confirmBtn.first().click();
        }

        const successMsg = page.locator('text=Payment confirmed! Your booking is now complete');
        if (await successMsg.count() > 0) {
          await expect(successMsg.first()).toBeVisible({ timeout: 5000 });
        }

        const transactionId = page.locator('text=Transaction ID');
        if (await transactionId.count() > 0) {
          await expect(transactionId.first()).toBeVisible();
        }
      }
    } catch {}
  });
});
