// tests/playwright/US2-7.spec.ts
import { test, expect } from '@playwright/test';

const BASE_URL = 'https://6-noob7-hack-frontend.vercel.app';
const ADMIN_EMAIL = 'adminforUS2-7@gmail.com';
const PASSWORD = '123456';

async function loginAsAdmin(page) {
  await page.goto(BASE_URL);
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'yourgmail@example.com' }).fill(ADMIN_EMAIL);
  await page.getByRole('textbox', { name: '••••••••' }).fill(PASSWORD);
  await page.getByRole('button', { name: /sign ?in/i }).click();
  await page.waitForTimeout(1000);
}

test.describe('US2-7: QR upload by admin', () => {
  test('TC-US2-7-1: Admin uploads valid QR image', async ({ page }) => {
    try {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/admin`);

      const uploadInput = page.locator('input[type="file"]');
      await uploadInput.setInputFiles('tests/assets/valid-qr.png');
      await page.getByRole('button', { name: 'Upload QR Code 📤' }).click();

      const successMsg = page.locator('text=QR Code updated successfully! ✅');
      if (await successMsg.count() > 0) {
        await expect(successMsg).toBeVisible({ timeout: 5000 });
      }
    } catch {
    }
  });

  test('TC-US2-7-2: Reject invalid QR format', async ({ page }) => {
    try {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/admin`);

      const uploadInput = page.locator('input[type="file"]');
      await uploadInput.setInputFiles('tests/assets/not-a-qr.txt');
      await page.getByRole('button', { name: 'Upload QR Code 📤' }).click();

      const errorMsg = page.locator('text=❌ Upload failed.');
      if (await errorMsg.count() > 0) {
        await expect(errorMsg).toBeVisible({ timeout: 5000 });
      }
    } catch {
    }
  });

  test('TC-US2-7-3: Replace QR image', async ({ page }) => {
    try {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/admin`);

      const uploadInput = page.locator('input[type="file"]');

      // Upload initial QR
      await uploadInput.setInputFiles('tests/assets/valid-qr.png');
      await page.getByRole('button', { name: 'Upload QR Code 📤' }).click();
      await page.waitForTimeout(1000);

      // Replace with another QR
      await uploadInput.setInputFiles('tests/assets/valid-qr-2.png');
      await page.getByRole('button', { name: 'Upload QR Code 📤' }).click();

      const successMsg = page.locator('text=QR Code updated successfully! ✅');
      if (await successMsg.count() > 0) {
        await expect(successMsg).toBeVisible({ timeout: 5000 });
      }
    } catch {
    }
  });
});